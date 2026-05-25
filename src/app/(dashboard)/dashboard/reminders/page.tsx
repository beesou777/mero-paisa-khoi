import Link from "next/link";
import { format } from "date-fns";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/server";
import { formatMoney } from "@/lib/utils";
import { listReminderLogsForUser } from "@/server/repositories/debts";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const reminders = await listReminderLogsForUser(supabase, user.id);

  return (
    <>
      <DashboardPageHeader
        title="Reminder Mail"
        description="Track reminder emails sent manually or by schedule"
        action={
        <Link href="/dashboard/debts">
          <Button>Send reminder</Button>
        </Link>
        }
      />
      <div className="rounded-lg border bg-white p-4">
        {reminders.length ? (
          <>
            <div className="space-y-3 md:hidden">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="rounded-xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {reminder.debt?.contacts?.name ?? "Unknown"}
                      </p>
                      <p className="truncate text-xs text-muted">{reminder.email}</p>
                    </div>
                    <Badge variant={reminder.success ? "paid" : "overdue"}>
                      {reminder.success ? "sent" : "failed"}
                    </Badge>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] font-semibold uppercase text-slate-500">Type</p>
                      <p className="mt-1">{reminder.reminder_type.replaceAll("_", " ")}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase text-slate-500">Balance</p>
                      <p className="mt-1 font-semibold">
                        {formatMoney(reminder.debt?.remaining_amount ?? 0, reminder.debt?.currency)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted">
                    {format(new Date(reminder.sent_at), "MMM d, yyyy p")}
                  </p>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Balance</th>
                  <th className="px-4 py-3">Sent at</th>
                  <th className="px-4 py-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reminders.map((reminder) => (
                  <tr key={reminder.id}>
                    <td className="px-4 py-3 font-medium">
                      {reminder.debt?.contacts?.name ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3 text-muted">{reminder.email}</td>
                    <td className="px-4 py-3">{reminder.reminder_type.replaceAll("_", " ")}</td>
                    <td className="px-4 py-3 font-semibold">
                      {formatMoney(reminder.debt?.remaining_amount ?? 0, reminder.debt?.currency)}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {format(new Date(reminder.sent_at), "MMM d, yyyy p")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={reminder.success ? "paid" : "overdue"}>
                        {reminder.success ? "sent" : "failed"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            title="No reminder mail yet"
            description="Use the three-dot action menu on a debt with an email address to send a reminder."
          />
        )}
      </div>
    </>
  );
}
