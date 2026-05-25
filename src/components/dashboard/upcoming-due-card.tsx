import Link from "next/link";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney, initials } from "@/lib/utils";
import type { DebtWithContact } from "@/types/database";

export function UpcomingDueCard({ debts }: { debts: DebtWithContact[] }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Due this week</h3>
          <p className="mt-1 text-xs text-muted">The next balances needing attention.</p>
        </div>
        <CalendarClock className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-5 space-y-3">
        {debts.length ? (
          debts.slice(0, 4).map((debt) => (
            <Link
              key={debt.id}
              href={`/dashboard/debts/${debt.id}`}
              className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary/40 hover:bg-emerald-50/40"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {initials(debt.contacts?.name ?? "Unknown")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{debt.contacts?.name ?? "Unknown"}</p>
                <p className="text-xs text-muted">
                  {debt.direction === "owed_to_me" ? "Owes me" : "I owe"} ·{" "}
                  {format(new Date(debt.due_date), "MMM d")}
                </p>
              </div>
              <p className="text-sm font-semibold">
                {formatMoney(debt.remaining_amount, debt.currency)}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted">Nothing due in the next 7 days.</p>
        )}
      </div>
    </Card>
  );
}
