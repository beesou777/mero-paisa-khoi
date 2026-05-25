import { differenceInCalendarDays, isToday } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import { renderReminderEmail } from "@/features/reminder/email-templates";
import { getMailClient } from "@/lib/mail/client";
import { getServerEnv } from "@/lib/validations/env";
import { logReminder } from "@/server/repositories/debts";
import type { Database, DebtWithContact, ReminderType } from "@/types/database";

type Client = SupabaseClient<Database>;
type ReminderTone = "friendly" | "gentle" | "direct";

function extractEnvelopeEmail(value: string) {
  const match = value.match(/<([^>]+)>/);
  return match?.[1] ?? value;
}

export async function sendDebtReminder(
  client: Client,
  debt: DebtWithContact,
  reminderType: ReminderType,
  options?: {
    tone?: ReminderTone;
    senderName?: string;
    replyTo?: string;
  },
) {
  const email = debt.contacts?.email;
  if (!email) {
    await logReminder(client, debt.id, "missing-email", reminderType, false);
    throw new Error("This contact does not have an email address.");
  }

  const mailer = getMailClient();
  const env = getServerEnv();
  const { data: profile } = await client
    .from("profiles")
    .select("full_name, email, reminder_tone")
    .eq("id", debt.user_id)
    .maybeSingle();
  const senderName = options?.senderName || profile?.full_name || "A friend";
  const replyTo = options?.replyTo || profile?.email || undefined;
  const tone = (options?.tone || profile?.reminder_tone || "friendly") as ReminderTone;
  const template = renderReminderEmail(reminderType, debt, { senderName, tone });
  const fromEmail = extractEnvelopeEmail(env.SMTP_FROM_EMAIL);

  try {
    await mailer.sendMail({
      from: senderName ? `"${senderName} via Asti Ko Paisa" <${fromEmail}>` : env.SMTP_FROM_EMAIL,
      to: email,
      replyTo,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
    await logReminder(client, debt.id, email, reminderType, true);
  } catch (error) {
    await logReminder(client, debt.id, email, reminderType, false);
    throw error;
  }
}

export function getScheduledReminderType(debt: DebtWithContact): ReminderType | null {
  if (!debt.reminder_enabled || debt.status === "paid") return null;

  const daysOverdue = differenceInCalendarDays(new Date(), new Date(debt.due_date));
  if (isToday(new Date(debt.due_date))) return "due_today";
  if (daysOverdue === 3) return "overdue_3_days";
  if (daysOverdue > 3 && daysOverdue % 7 === 0) return "overdue_weekly";
  return null;
}
