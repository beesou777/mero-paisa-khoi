import { format, formatDistanceToNow, isBefore } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DebtRowActions } from "@/components/debt/debt-row-actions";
import { formatMoney, initials } from "@/lib/utils";
import type { DebtWithContact } from "@/types/database";

export function DebtTable({
  debts,
  latestReminders = {},
  reminderTone = "friendly",
  senderName,
}: {
  debts: DebtWithContact[];
  latestReminders?: Record<
    string,
    {
      sent_at: string;
      success: boolean;
    }
  >;
  reminderTone?: "friendly" | "gentle" | "direct";
  senderName?: string;
}) {
  return (
    <div className="rounded-lg bg-white md:border">
      <div className="space-y-2 md:hidden">
        {debts.map((debt) => {
          const contactName = debt.contacts?.name ?? "Unknown";
          const overdue =
            debt.status !== "paid" && isBefore(new Date(debt.due_date), new Date());

          return (
            <div key={debt.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                    {initials(contactName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{contactName}</p>
                    <p className="truncate text-xs text-muted">
                      {debt.contacts?.email ?? "No email"}
                    </p>
                  </div>
                </div>
                <DebtRowActions debt={debt} reminderTone={reminderTone} senderName={senderName} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Amount</p>
                  <p className="mt-1 font-semibold">
                    {formatMoney(debt.remaining_amount, debt.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Due date</p>
                  <p className="mt-1 text-muted">{format(new Date(debt.due_date), "MMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Direction</p>
                  <p className="mt-1 text-muted">
                    {debt.direction === "owed_to_me" ? "Owes me" : "I owe"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-500">Reminder</p>
                  <p className="mt-1 text-muted">
                    {!debt.contacts?.email
                      ? "Missing email"
                      : latestReminders[debt.id]
                        ? `${latestReminders[debt.id].success ? "Sent" : "Failed"} ${formatDistanceToNow(
                            new Date(latestReminders[debt.id].sent_at),
                            { addSuffix: true },
                          )}`
                        : debt.reminder_enabled
                          ? "Enabled"
                          : "Off"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Badge variant={overdue ? "overdue" : debt.status}>
                  {overdue ? "overdue" : debt.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto overflow-y-visible md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Direction</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Due date</th>
              <th className="px-4 py-3">Reminder</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {debts.map((debt) => {
              const contactName = debt.contacts?.name ?? "Unknown";
              const overdue =
                debt.status !== "paid" && isBefore(new Date(debt.due_date), new Date());

              return (
                <tr key={debt.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {initials(contactName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{contactName}</p>
                        <p className="truncate text-xs text-muted">
                          {debt.contacts?.email ?? "No email"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {debt.direction === "owed_to_me" ? "Owes me" : "I owe"}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {formatMoney(debt.remaining_amount, debt.currency)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {format(new Date(debt.due_date), "MMM d, yyyy")}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {!debt.contacts?.email
                      ? "Missing email"
                      : latestReminders[debt.id]
                        ? `${latestReminders[debt.id].success ? "Sent" : "Failed"} ${formatDistanceToNow(
                            new Date(latestReminders[debt.id].sent_at),
                            { addSuffix: true },
                          )}`
                        : debt.reminder_enabled
                          ? "Enabled"
                          : "Off"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={overdue ? "overdue" : debt.status}>
                      {overdue ? "overdue" : debt.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DebtRowActions debt={debt} reminderTone={reminderTone} senderName={senderName} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
