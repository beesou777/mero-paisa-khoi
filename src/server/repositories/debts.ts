import { isBefore, startOfToday } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateDebtInput } from "@/lib/validations/debt";
import type { Database, DebtStatus, DebtWithContact, ReminderType } from "@/types/database";

type Client = SupabaseClient<Database>;
type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
type ReminderLogRow = Database["public"]["Tables"]["reminder_logs"]["Row"];
type ActivityLogRow = Database["public"]["Tables"]["activity_logs"]["Row"];

export async function upsertContact(client: Client, userId: string, name: string, email?: string) {
  const { data: existing } = await client
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .ilike("name", name)
    .maybeSingle();

  if (existing) {
    if (email && existing.email !== email) {
      const { data, error } = await client
        .from("contacts")
        .update({ email })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
    return existing;
  }

  const { data, error } = await client
    .from("contacts")
    .insert({ user_id: userId, name, email: email || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function createDebt(client: Client, userId: string, input: CreateDebtInput) {
  const contact = await upsertContact(client, userId, input.contactName, input.email || undefined);
  const status: DebtStatus = isBefore(new Date(input.dueDate), startOfToday())
    ? "overdue"
    : "pending";

  const { data, error } = await client
    .from("debts")
    .insert({
      user_id: userId,
      contact_id: contact.id,
      amount: input.amount,
      remaining_amount: input.amount,
      currency: input.currency,
      direction: input.direction,
      status,
      due_date: input.dueDate,
      notes: input.notes || null,
      original_input: input.originalInput || null,
      reminder_enabled: input.reminderEnabled,
    })
    .select("*")
    .single();
  if (error) throw error;

  await client.from("activity_logs").insert({
    debt_id: data.id,
    action: "debt_created",
    metadata: { amount: input.amount, direction: input.direction },
  });

  return { ...data, contacts: contact } as DebtWithContact;
}

export async function listDebts(client: Client, userId: string) {
  const { data, error } = await client
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true });

  if (error) throw error;
  const debts = data ?? [];
  const contactIds = [...new Set(debts.map((debt) => debt.contact_id))];
  const { data: contacts, error: contactsError } = await client
    .from("contacts")
    .select("*")
    .in("id", contactIds.length ? contactIds : ["00000000-0000-0000-0000-000000000000"]);
  if (contactsError) throw contactsError;

  return debts.map((debt) => ({
    ...debt,
    contacts: contacts?.find((contact) => contact.id === debt.contact_id) ?? null,
  })) as DebtWithContact[];
}

export async function getDebt(client: Client, userId: string, debtId: string) {
  const { data, error } = await client
    .from("debts")
    .select("*")
    .eq("user_id", userId)
    .eq("id", debtId)
    .single();

  if (error) throw error;
  const { data: contact, error: contactError } = await client
    .from("contacts")
    .select("*")
    .eq("id", data.contact_id)
    .single();
  if (contactError) throw contactError;
  return { ...data, contacts: contact } as DebtWithContact;
}

export async function listDebtActivity(client: Client, debtId: string) {
  const [payments, reminders, activities] = await Promise.all([
    client.from("payments").select("*").eq("debt_id", debtId).order("paid_at", { ascending: false }),
    client
      .from("reminder_logs")
      .select("*")
      .eq("debt_id", debtId)
      .order("sent_at", { ascending: false }),
    client
      .from("activity_logs")
      .select("*")
      .eq("debt_id", debtId)
      .order("created_at", { ascending: false }),
  ]);

  if (payments.error) throw payments.error;
  if (reminders.error) throw reminders.error;
  if (activities.error) throw activities.error;

  return {
    payments: (payments.data ?? []) as PaymentRow[],
    reminders: (reminders.data ?? []) as ReminderLogRow[],
    activities: (activities.data ?? []) as ActivityLogRow[],
  };
}

export async function listPaymentsForUser(client: Client, userId: string) {
  const debts = await listDebts(client, userId);
  const debtIds = debts.map((debt) => debt.id);
  if (!debtIds.length) return [];

  const { data, error } = await client
    .from("payments")
    .select("*")
    .in("debt_id", debtIds)
    .order("paid_at", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as PaymentRow[]).map((payment) => ({
    ...payment,
    debt: debts.find((debt) => debt.id === payment.debt_id) ?? null,
  }));
}

export async function listReminderLogsForUser(client: Client, userId: string) {
  const debts = await listDebts(client, userId);
  const debtIds = debts.map((debt) => debt.id);
  if (!debtIds.length) return [];

  const { data, error } = await client
    .from("reminder_logs")
    .select("*")
    .in("debt_id", debtIds)
    .order("sent_at", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as ReminderLogRow[]).map((reminder) => ({
    ...reminder,
    debt: debts.find((debt) => debt.id === reminder.debt_id) ?? null,
  }));
}

export async function addPayment(
  client: Client,
  debt: DebtWithContact,
  amount: number,
  note?: string,
) {
  const paymentAmount = Math.min(amount, debt.remaining_amount);
  const remaining = Math.max(0, debt.remaining_amount - paymentAmount);
  const status: DebtStatus = remaining === 0 ? "paid" : "partial";

  const { error: paymentError } = await client.from("payments").insert({
    debt_id: debt.id,
    amount: paymentAmount,
    note: note || null,
  });
  if (paymentError) throw paymentError;

  const { error: debtError } = await client
    .from("debts")
    .update({ remaining_amount: remaining, status })
    .eq("id", debt.id);
  if (debtError) throw debtError;

  await client.from("activity_logs").insert({
    debt_id: debt.id,
    action: status === "paid" ? "marked_paid" : "partial_payment_added",
    metadata: { amount: paymentAmount, remaining },
  });
}

export async function logReminder(
  client: Client,
  debtId: string,
  email: string,
  reminderType: ReminderType,
  success: boolean,
) {
  await client.from("reminder_logs").insert({
    debt_id: debtId,
    email,
    reminder_type: reminderType,
    success,
  });

  await client.from("activity_logs").insert({
    debt_id: debtId,
    action: "reminder_sent",
    metadata: { email, reminderType, success },
  });
}
