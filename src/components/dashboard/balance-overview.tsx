import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

export function BalanceOverview({
  owedToMe,
  iOwe,
  overdue,
}: {
  owedToMe: number;
  iOwe: number;
  overdue: number;
}) {
  const max = Math.max(owedToMe, iOwe, overdue, 1);
  const items = [
    { label: "Collectable", value: owedToMe, color: "bg-primary" },
    { label: "Payable", value: iOwe, color: "bg-accent" },
    { label: "Overdue risk", value: overdue, color: "bg-danger" },
  ];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">Balance overview</h3>
          <p className="mt-1 text-xs text-muted">A quick read of current money movement.</p>
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted">{formatMoney(item.value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{ width: `${Math.max((item.value / max) * 100, item.value ? 8 : 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
