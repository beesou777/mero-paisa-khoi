import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { ToastMessage } from "@/components/shared/toast-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateSettingsAction } from "@/features/auth/profile-actions";
import { createSupabaseServerClient } from "@/lib/db/server";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ toast?: string; toastType?: "success" | "error" }>;
}) {
  const { toast, toastType } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  const profile = data as Profile | null;

  return (
    <>
      <DashboardPageHeader
        title="Settings"
        description="Profile and default debt preferences"
      />
      <ToastMessage message={toast} type={toastType} />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <p className="text-sm text-muted">
            Keep reminders polite and profile details current.
          </p>
        </CardHeader>
        <CardContent>
          <form action={updateSettingsAction} className="space-y-4">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input name="fullName" defaultValue={profile?.full_name ?? ""} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email ?? ""} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Reminder tone</Label>
              <select
                name="reminderTone"
                defaultValue={profile?.reminder_tone ?? "friendly"}
                className="h-10 w-full rounded-lg border bg-white px-3 text-sm font-medium outline-none"
              >
                <option value="friendly">Friendly</option>
                <option value="gentle">Gentle</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                name="emailReminders"
                type="checkbox"
                defaultChecked={profile?.email_reminders ?? true}
              />
              Enable email reminders by default
            </label>
            <div className="space-y-2">
              <Label>Currency</Label>
              <div className="rounded-lg border bg-slate-50 px-3 py-3 text-sm font-medium">
                NRs only
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input
                name="defaultReminderEnabled"
                type="checkbox"
                defaultChecked={profile?.default_reminder_enabled ?? true}
              />
              Turn reminder on by default for new debts
            </label>
            <SubmitButton pendingText="Saving settings...">Save settings</SubmitButton>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
