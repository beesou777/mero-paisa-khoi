import { UsersRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/utils";

export function TopContactsCard({
  contacts,
}: {
  contacts: Array<{
    name: string;
    count: number;
    balance: number;
    direction: "owed_to_me" | "i_owe" | "mixed";
  }>;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">Top contacts</h3>
          <p className="mt-1 text-xs text-muted">Who currently has the biggest open balance.</p>
        </div>
        <UsersRound className="h-5 w-5 text-primary" />
      </div>

      <div className="mt-5 space-y-3">
        {contacts.length ? (
          contacts.map((contact) => (
            <div key={contact.name} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{contact.name}</p>
                <p className="text-sm font-semibold">{formatMoney(contact.balance)}</p>
              </div>
              <p className="mt-1 text-xs text-muted">
                {contact.count} open {contact.count === 1 ? "debt" : "debts"} ·{" "}
                {contact.direction === "mixed"
                  ? "mixed direction"
                  : contact.direction === "owed_to_me"
                    ? "owes me"
                    : "I owe"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted">No open contacts yet.</p>
        )}
      </div>
    </Card>
  );
}
