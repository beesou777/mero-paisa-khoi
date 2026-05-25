import Link from "next/link";
import { CalendarClock, Mail } from "lucide-react";
import { format, isBefore } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMoney, initials } from "@/lib/utils";
import type { DebtWithContact } from "@/types/database";

export function DebtCard({ debt }: { debt: DebtWithContact }) {
  const contactName = debt.contacts?.name ?? "Unknown";
  const overdue = debt.status !== "paid" && isBefore(new Date(debt.due_date), new Date());

  return (
    <Link href={`/dashboard/debts/${debt.id}`} className="block">
      <Card className="p-4 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 font-heading font-bold text-primary">
              {initials(contactName)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-bold">{contactName}</p>
              <p className="text-sm text-muted">
                {debt.direction === "owed_to_me" ? "Owes you" : "You owe"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-heading text-xl font-bold">
              {formatMoney(debt.remaining_amount, debt.currency)}
            </p>
            <Badge variant={overdue ? "overdue" : debt.status}>{overdue ? "overdue" : debt.status}</Badge>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" />
            Due {format(new Date(debt.due_date), "MMM d")}
          </span>
          {debt.contacts?.email ? (
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              Reminder ready
            </span>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
