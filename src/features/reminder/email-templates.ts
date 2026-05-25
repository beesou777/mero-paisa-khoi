import { format } from "date-fns";
import { formatMoney } from "@/lib/utils";
import type { DebtWithContact, ReminderType } from "@/types/database";

type ReminderTone = "friendly" | "gentle" | "direct";

function reminderCopy(type: ReminderType, debt: DebtWithContact, tone: ReminderTone) {
  const amount = formatMoney(debt.remaining_amount, debt.currency);
  const due = format(new Date(debt.due_date), "PPP");

  if (type === "due_today") {
    if (tone === "direct") {
      return `This is a reminder that ${amount} is due today. Please confirm once it has been settled.`;
    }
    if (tone === "gentle") {
      return `Just checking in about ${amount}, which is due today. Whenever convenient, please send an update.`;
    }
    return `Just a quick reminder that ${amount} is due today. No pressure, just keeping the record clear.`;
  }

  if (type === "overdue_3_days" || type === "overdue_weekly") {
    if (tone === "direct") {
      return `This is a reminder that ${amount} was due on ${due}. Please reply with an update or settle it when possible.`;
    }
    if (tone === "gentle") {
      return `Just checking in about ${amount}, which was due on ${due}. When you get a chance, please send an update.`;
    }
    return `A quick reminder that ${amount} was due on ${due}. When you have a moment, please send an update.`;
  }

  if (tone === "direct") {
    return `This is a reminder about ${amount}, due on ${due}. Please confirm once it is settled.`;
  }
  if (tone === "gentle") {
    return `Just checking in about ${amount}, due on ${due}. When convenient, please let me know the plan.`;
  }
  return `Just a quick reminder about ${amount}, due on ${due}. Thanks for helping keep the record clear.`;
}

function reminderSubject(type: ReminderType, debt: DebtWithContact, tone: ReminderTone) {
  const amount = formatMoney(debt.remaining_amount, debt.currency);

  if (type === "due_today") return `Reminder: ${amount} due today`;
  if (type === "overdue_3_days" || type === "overdue_weekly") {
    return tone === "direct" ? `Overdue reminder: ${amount}` : `Quick follow-up on ${amount}`;
  }
  return tone === "direct" ? `Payment reminder: ${amount}` : `Quick reminder about ${amount}`;
}

export function renderReminderEmail(
  type: ReminderType,
  debt: DebtWithContact,
  options?: {
    tone?: ReminderTone;
    senderName?: string;
  },
) {
  const contactName = debt.contacts?.name ?? "there";
  const senderName = options?.senderName?.trim() || "A friend";
  const tone = options?.tone ?? "friendly";
  const message = reminderCopy(type, debt, tone);
  const subject = reminderSubject(type, debt, tone);
  const amount = formatMoney(debt.remaining_amount, debt.currency);
  const due = format(new Date(debt.due_date), "PPP");

  const text = `Hi ${contactName},\n\n${message}\n\nAmount: ${amount}\nDue date: ${due}\n\nThank you,\n${senderName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background:#F6F8F5; padding:24px;">
      <div style="max-width:560px; margin:auto; background:#ffffff; border-radius:16px; padding:28px; border:1px solid #DFE8E2;">
        <div style="display:inline-block; border-radius:999px; background:#EAF8F0; color:#0F8A52; font-size:12px; font-weight:700; padding:8px 12px;">
          Payment reminder
        </div>
        <h1 style="margin:18px 0 10px; font-size:26px; line-height:1.2; color:#141A17;">Hi ${contactName},</h1>
        <p style="margin:0; font-size:16px; line-height:1.7; color:#42524B;">${message}</p>
        <div style="margin-top:18px; border-radius:14px; background:#F9FBF8; border:1px solid #E6ECE7; padding:16px;">
          <div style="font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.08em;">Amount</div>
          <div style="margin-top:6px; font-size:24px; font-weight:700; color:#141A17;">${amount}</div>
          <div style="margin-top:14px; font-size:12px; color:#6B7280; text-transform:uppercase; letter-spacing:0.08em;">Due date</div>
          <div style="margin-top:6px; font-size:16px; font-weight:600; color:#141A17;">${due}</div>
        </div>
        <p style="margin:20px 0 0; font-size:15px; line-height:1.7; color:#42524B;">
          Thank you,<br />${senderName}
        </p>
      </div>
    </div>
  `;

  return { subject, text, html };
}
