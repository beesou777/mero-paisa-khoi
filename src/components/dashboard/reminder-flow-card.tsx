import { Bell, CalendarClock, MailCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

const flow = [
  { label: "Due today", description: "Send a same-day nudge", icon: CalendarClock },
  { label: "Overdue 3 days", description: "Follow up gently", icon: Bell },
  { label: "Weekly overdue", description: "Repeat until paid", icon: MailCheck },
];

export function ReminderFlowCard() {
  return (
    <Card className="p-5">
      <h3 className="font-semibold">Reminder mail flow</h3>
      <p className="mt-1 text-xs text-muted">Email-only nudges for debts with contact email.</p>
      <div className="mt-5 space-y-4">
        {flow.map((item, index) => (
          <div key={item.label} className="flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-primary">
              <item.icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="text-xs text-muted">{item.description}</p>
            </div>
            {index < flow.length - 1 ? <span className="ml-auto mt-4 h-px w-8 border-t border-dashed" /> : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
