import Link from "next/link";
import { format } from "date-fns";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/server";
import { formatMoney, initials } from "@/lib/utils";
import { listPaymentsForUser } from "@/server/repositories/debts";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const payments = await listPaymentsForUser(supabase, user.id);

  return (
    <>
      <DashboardPageHeader
        title="Payments"
        description="Review full and partial payments recorded in Asti Ko Paisa"
        action={
        <Link href="/dashboard/debts">
          <Button>Record payment</Button>
        </Link>
        }
      />
      <div className="rounded-lg border bg-white p-4">
        {payments.length ? (
          <>
            <div className="space-y-3 md:hidden">
              {payments.map((payment) => {
                const contact = payment.debt?.contacts?.name ?? "Unknown";
                return (
                  <div key={payment.id} className="rounded-xl border p-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                        {initials(contact)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{contact}</p>
                        <p className="text-xs text-muted">
                          {format(new Date(payment.paid_at), "MMM d, yyyy p")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Amount</p>
                        <p className="mt-1 font-semibold">
                          {formatMoney(payment.amount, payment.debt?.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold uppercase text-slate-500">Status</p>
                        <div className="mt-1">
                          <Badge variant={payment.debt?.status ?? "neutral"}>
                            {payment.debt?.status ?? "unknown"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted">{payment.note ?? "No note"}</p>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Debt status</th>
                  <th className="px-4 py-3">Paid at</th>
                  <th className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((payment) => {
                  const contact = payment.debt?.contacts?.name ?? "Unknown";
                  return (
                    <tr key={payment.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">
                            {initials(contact)}
                          </span>
                          <span className="font-medium">{contact}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatMoney(payment.amount, payment.debt?.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={payment.debt?.status ?? "neutral"}>
                          {payment.debt?.status ?? "unknown"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {format(new Date(payment.paid_at), "MMM d, yyyy p")}
                      </td>
                      <td className="px-4 py-3 text-muted">{payment.note ?? "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            title="No payments recorded"
            description="Use the three-dot action menu on a debt to mark paid or add a partial payment."
          />
        )}
      </div>
    </>
  );
}
