"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/server";
import { createDebtSchema, partialPaymentSchema, updateContactSchema } from "@/lib/validations/debt";
import {
  addPayment,
  createDebt,
  getDebt,
} from "@/server/repositories/debts";
import { sendDebtReminder } from "@/server/services/reminders";

function withToast(path: string, message: string, type: "success" | "error" = "success") {
  const url = new URL(path, "http://local");
  url.searchParams.set("toast", message);
  url.searchParams.set("toastType", type);
  return `${url.pathname}${url.search}`;
}

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");
  return { supabase, user };
}

export async function createDebtAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const returnTo = String(formData.get("returnTo") || "/dashboard/debts");
  const { data: profile } = await supabase
    .from("profiles")
    .select("default_currency, default_reminder_enabled")
    .eq("id", user.id)
    .maybeSingle();
  const input = createDebtSchema.parse({
    contactName: formData.get("contactName"),
    amount: formData.get("amount"),
    dueDate: formData.get("dueDate"),
    direction: formData.get("direction"),
    originalInput: formData.get("originalInput") || undefined,
    email: formData.get("email") || undefined,
    notes: formData.get("notes") || undefined,
    reminderEnabled: formData.get("reminderEnabled") === "on",
    currency: String(profile?.default_currency || "NPR"),
  });

  await createDebt(supabase, user.id, input);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/debts");
  redirect(withToast(returnTo, "Debt added successfully."));
}

export async function addPaymentAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const returnTo = String(formData.get("returnTo") || "/dashboard/debts");
  const input = partialPaymentSchema.parse({
    debtId: formData.get("debtId"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });

  const debt = await getDebt(supabase, user.id, input.debtId);
  await addPayment(supabase, debt, input.amount, input.note);
  revalidatePath(`/dashboard/debts/${input.debtId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/debts");
  revalidatePath("/dashboard/payments");
  redirect(withToast(returnTo, "Payment recorded."));
}

export async function updateContactAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const returnTo = String(formData.get("returnTo") || "/dashboard/debts");
  const input = updateContactSchema.parse({
    debtId: formData.get("debtId"),
    contactName: formData.get("contactName"),
    email: formData.get("email") || undefined,
  });

  const debt = await getDebt(supabase, user.id, input.debtId);
  const { error } = await supabase
    .from("contacts")
    .update({
      name: input.contactName,
      email: input.email || null,
    })
    .eq("id", debt.contact_id);

  if (error) {
    redirect(withToast(returnTo, error.message, "error"));
  }

  revalidatePath(`/dashboard/debts/${input.debtId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/debts");
  revalidatePath("/dashboard/reminders");
  redirect(withToast(returnTo, "Contact updated."));
}

export async function markPaidAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const debtId = String(formData.get("debtId"));
  const returnTo = String(formData.get("returnTo") || "/dashboard/debts");
  const debt = await getDebt(supabase, user.id, debtId);
  await addPayment(supabase, debt, debt.remaining_amount, "Marked paid");
  revalidatePath(`/dashboard/debts/${debtId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/debts");
  revalidatePath("/dashboard/payments");
  redirect(withToast(returnTo, "Debt marked as paid."));
}

export async function sendReminderAction(formData: FormData) {
  const { supabase, user } = await requireUser();
  const debtId = String(formData.get("debtId"));
  const returnTo = String(formData.get("returnTo") || "/dashboard/debts");
  const debt = await getDebt(supabase, user.id, debtId);
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, reminder_tone")
    .eq("id", user.id)
    .maybeSingle();
  try {
    await sendDebtReminder(supabase, debt, "manual", {
      senderName: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0],
      replyTo: user.email ?? undefined,
      tone: profile?.reminder_tone as "friendly" | "gentle" | "direct" | undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to send reminder.";
    redirect(withToast(returnTo, message, "error"));
  }
  revalidatePath(`/dashboard/debts/${debtId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/reminders");
  redirect(withToast(returnTo, "Reminder email sent."));
}
