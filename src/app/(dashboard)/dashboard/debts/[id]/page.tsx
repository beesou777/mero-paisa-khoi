import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, CheckCircle2, HandCoins } from "lucide-react";
import { addPaymentAction, markPaidAction } from "@/features/debt/actions";
import { DebtDetailActions } from "@/components/debt/debt-detail-actions";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { ToastMessage } from "@/components/shared/toast-message";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { createSupabaseServerClient } from "@/lib/db/server";
import { formatMoney } from "@/lib/utils";
import { getDebt, listDebtActivity } from "@/server/repositories/debts";

export const dynamic = "force-dynamic";

export default async function DebtDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ toast?: string; toastType?: "success" | "error" }>;
}) {
  const { id } = await params;
  const { toast, toastType } = await searchParams;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, reminder_tone")
    .eq("id", user.id)
    .maybeSingle();

  const debt = await getDebt(supabase, user.id, id);
  const detail = await listDebtActivity(supabase, id);
  const contact = debt.contacts;

  return (
    <>
      <DashboardPageHeader
        title="Debt detail"
        description="Review payments, reminders, and activity for one record"
      />
      <div className="space-y-6">
        <ToastMessage message={toast} type={toastType} />
        <Link
          href="/dashboard/debts"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to debts
        </Link>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl">{contact?.name ?? "Unknown contact"}</CardTitle>
                <p className="mt-1 text-muted">
                  {debt.direction === "owed_to_me" ? "They owe you" : "You owe them"} by{" "}
                  {format(new Date(debt.due_date), "PPP")}
                </p>
              </div>
              <Badge variant={debt.status}>{debt.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Summary label="Original amount" value={formatMoney(debt.amount, debt.currency)} />
            <Summary label="Remaining" value={formatMoney(debt.remaining_amount, debt.currency)} />
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-sm font-bold text-muted">Reminder email</p>
              <p className="mt-1 break-words font-heading text-xl font-bold">
                {contact?.email ?? "Not set"}
              </p>
              <DebtDetailActions
                debt={debt}
                reminderTone={(profile?.reminder_tone as "friendly" | "gentle" | "direct" | undefined) ?? "friendly"}
                senderName={profile?.full_name ?? undefined}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detail.activities.length ? (
                  detail.activities.map((activity) => (
                    <div key={activity.id} className="rounded-lg bg-slate-50 p-3">
                      <p className="font-bold">{activity.action.replaceAll("_", " ")}</p>
                      <p className="text-sm text-muted">
                        {format(new Date(activity.created_at), "PPp")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No activity yet.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reminder logs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detail.reminders.length ? (
                  detail.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex justify-between rounded-lg bg-emerald-50 p-3">
                      <span className="font-bold">{reminder.reminder_type.replaceAll("_", " ")}</span>
                      <span className="text-sm text-muted">
                        {reminder.success ? "Sent" : "Failed"} · {format(new Date(reminder.sent_at), "PP")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No reminders sent yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <form action={markPaidAction}>
                  <input type="hidden" name="debtId" value={debt.id} />
                  <input type="hidden" name="returnTo" value={`/dashboard/debts/${debt.id}`} />
                  <SubmitButton className="w-full" variant="primary" disabled={debt.status === "paid"} pendingText="Marking paid...">
                    <CheckCircle2 className="h-4 w-4" />
                    Mark paid
                  </SubmitButton>
                </form>
                <DebtDetailActions
                  debt={debt}
                  reminderTone={(profile?.reminder_tone as "friendly" | "gentle" | "direct" | undefined) ?? "friendly"}
                  senderName={profile?.full_name ?? undefined}
                  showEdit={false}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Add partial payment</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={addPaymentAction} className="space-y-3">
                  <input type="hidden" name="debtId" value={debt.id} />
                  <input type="hidden" name="returnTo" value={`/dashboard/debts/${debt.id}`} />
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input name="amount" type="number" min="1" max={debt.remaining_amount} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Note</Label>
                    <Input name="note" placeholder="Paid cash, bank transfer..." />
                  </div>
                  <SubmitButton className="w-full" variant="secondary" pendingText="Saving payment...">
                    <HandCoins className="h-4 w-4" />
                    Add payment
                  </SubmitButton>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detail.payments.length ? (
                  detail.payments.map((payment) => (
                    <div key={payment.id} className="rounded-lg bg-emerald-50 p-3">
                      <p className="font-bold">{formatMoney(payment.amount, debt.currency)}</p>
                      <p className="text-sm text-muted">{format(new Date(payment.paid_at), "PPp")}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted">No payments recorded.</p>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm font-bold text-muted">{label}</p>
      <p className="mt-1 break-words font-heading text-xl font-bold">{value}</p>
    </div>
  );
}
