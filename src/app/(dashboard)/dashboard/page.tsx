import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DebtTable } from "@/components/debt/debt-table";
import { BalanceOverview } from "@/components/dashboard/balance-overview";
import { RecentRemindersCard } from "@/components/dashboard/recent-reminders-card";
import { ReminderFlowCard } from "@/components/dashboard/reminder-flow-card";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { TopContactsCard } from "@/components/dashboard/top-contacts-card";
import { UpcomingDueCard } from "@/components/dashboard/upcoming-due-card";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/server";
import {
  getDashboardSummary,
  getLargestBalances,
  getTopContacts,
  getUpcomingDebts,
} from "@/server/queries/dashboard";
import { listDebts, listReminderLogsForUser } from "@/server/repositories/debts";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  const debts = await listDebts(supabase, user.id);
  const reminders = await listReminderLogsForUser(supabase, user.id);
  const summary = getDashboardSummary(debts);
  const recentDebts = debts
    .filter((debt) => debt.status !== "paid")
    .slice(0, 5);
  const upcomingDebts = getUpcomingDebts(debts);
  const largestBalances = getLargestBalances(debts);
  const topContacts = getTopContacts(debts);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Keep your money conversations organized."
        description="See upcoming dues, recent reminders, and the balances that need attention first."
        action={
        <Link href="/dashboard/debts">
          <Button>Manage debts</Button>
        </Link>
        }
      />
      <SummaryCards summary={summary} />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <BalanceOverview
            owedToMe={summary.owedToMe}
            iOwe={summary.iOwe}
            overdue={summary.overdue}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <UpcomingDueCard debts={upcomingDebts} />
            <RecentRemindersCard reminders={reminders} />
          </div>

          <div className="rounded-lg border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
              <div>
                <h3 className="font-semibold">Recent active debts</h3>
                <p className="text-xs text-muted">
                  Overview only. Use Debts for full entry and filtering.
                </p>
              </div>
              <Link
                href="/dashboard/debts"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                Open debts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="p-4">
              {recentDebts.length ? (
                <DebtTable
                  debts={recentDebts}
                  reminderTone={(profile?.reminder_tone as "friendly" | "gentle" | "direct" | undefined) ?? "friendly"}
                  senderName={profile?.full_name ?? undefined}
                  latestReminders={Object.fromEntries(
                    reminders.map((reminder) => [
                      reminder.debt_id,
                      {
                        sent_at: reminder.sent_at,
                        success: reminder.success,
                      },
                    ]),
                  )}
                />
              ) : (
                <EmptyState
                  title="No active debts"
                  description="When you add debts, the latest active records will appear here."
                />
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <ReminderFlowCard />
          <TopContactsCard contacts={topContacts} />
          <div className="rounded-lg border bg-[#101815] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Next best action
            </p>
            <h3 className="mt-4 text-xl font-semibold">Keep the list current.</h3>
            <p className="mt-3 text-sm leading-6 text-emerald-50/80">
              Mark paid debts as complete from the three-dot menu, or add partial payments as soon
              as money comes in.
            </p>
          </div>
          <div className="rounded-lg border bg-white p-5">
            <h3 className="font-semibold">Largest balances</h3>
            <p className="mt-1 text-xs text-muted">The highest outstanding records right now.</p>
            <div className="mt-4 space-y-3">
              {largestBalances.length ? (
                largestBalances.map((debt) => (
                  <Link
                    key={debt.id}
                    href={`/dashboard/debts/${debt.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3 hover:border-primary/40 hover:bg-emerald-50/30"
                  >
                    <div>
                      <p className="text-sm font-semibold">{debt.contacts?.name ?? "Unknown"}</p>
                      <p className="text-xs text-muted">
                        {debt.direction === "owed_to_me" ? "owes me" : "I owe"}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {debt.remaining_amount.toLocaleString("en-NP")}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted">No open balances yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
