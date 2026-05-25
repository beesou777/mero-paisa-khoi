import { AlertTriangle, CheckCircle2, HandCoins, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

const items = [
  { key: "owedToMe", label: "People owe me", icon: HandCoins, tint: "bg-emerald-50 text-primary" },
  { key: "iOwe", label: "I owe", icon: Wallet, tint: "bg-teal-50 text-accent" },
  { key: "overdue", label: "Overdue", icon: AlertTriangle, tint: "bg-rose-50 text-danger" },
  { key: "recentlyPaid", label: "Recently paid", icon: CheckCircle2, tint: "bg-emerald-50 text-success" },
] as const;

export function SummaryCards({
  summary,
}: {
  summary: Record<(typeof items)[number]["key"], number>;
}) {
  return (
    <Card className="p-4 md:border">
      <div className="grid divide-y md:grid-cols-4 md:divide-x md:divide-y-0">
        {items.map((item) => (
          <div key={item.key} className="flex items-center gap-3 px-1 py-3 first:pt-0 last:pb-0 md:px-4 md:py-0">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.tint}`}>
              <item.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted">{item.label}</p>
              <p className="truncate text-xl font-semibold tracking-tight">
                {formatMoney(summary[item.key])}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
