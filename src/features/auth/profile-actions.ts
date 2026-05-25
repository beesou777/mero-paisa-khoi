"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/db/server";
import { settingsSchema } from "@/lib/validations/debt";

function withToast(path: string, message: string, type: "success" | "error" = "success") {
  const url = new URL(path, "http://local");
  url.searchParams.set("toast", message);
  url.searchParams.set("toastType", type);
  return `${url.pathname}${url.search}`;
}

export async function updateSettingsAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const input = settingsSchema.parse({
    fullName: formData.get("fullName") || undefined,
    reminderTone: formData.get("reminderTone") || "friendly",
    emailReminders: formData.get("emailReminders") === "on",
    defaultCurrency: "NPR",
    defaultReminderEnabled: formData.get("defaultReminderEnabled") === "on",
  });

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
    full_name: input.fullName ?? null,
    reminder_tone: input.reminderTone,
    email_reminders: input.emailReminders,
    default_currency: input.defaultCurrency,
    default_reminder_enabled: input.defaultReminderEnabled,
  });

  if (error) throw error;
  revalidatePath("/dashboard/settings");
  redirect(withToast("/dashboard/settings", "Settings saved."));
}
