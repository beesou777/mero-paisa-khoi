import { formatDistanceToNow } from "date-fns";
import { MailCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export function RecentRemindersCard({
  reminders,
}: {
  reminders: Array<{
    id: string;
    sent_at: string;
    success: boolean;
    reminder_type: string;
    debt: { contacts: { name: string | null } | null } | null;
  }>;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Recent reminders</h3>
          <p className="mt-1 text-xs text-muted">Latest manual or scheduled reminder activity.</p>
        </div>
        <MailCheck className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-5 space-y-3">
        {reminders.length ? (
          reminders.slice(0, 4).map((reminder) => (
            <div key={reminder.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">
                  {reminder.debt?.contacts?.name ?? "Unknown contact"}
                </p>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${
                    reminder.success
                      ? "bg-emerald-50 text-primary"
                      : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {reminder.success ? "sent" : "failed"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {reminder.reminder_type.replaceAll("_", " ")} ·{" "}
                {formatDistanceToNow(new Date(reminder.sent_at), { addSuffix: true })}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No reminders sent yet.</p>
        )}
      </div>
    </Card>
  );
}
