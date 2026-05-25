import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DebtsPageAction } from "@/components/debt/debts-page-client";
import { DebtTable } from "@/components/debt/debt-table";
import { DashboardPageHeader } from "@/components/shared/dashboard-page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ToastMessage } from "@/components/shared/toast-message";
import { createSupabaseServerClient } from "@/lib/db/server";
import { filterDebts, searchAndSortDebts } from "@/server/queries/dashboard";
import { listDebts, listReminderLogsForUser } from "@/server/repositories/debts";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

const tabs = [
  { id: "owed_to_me", label: "Owed to me" },
  { id: "i_owe", label: "I owe" },
  { id: "overdue", label: "Overdue" },
];

export default async function DebtsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    toast?: string;
    toastType?: "success" | "error";
    search?: string;
    reminder?: string;
    sort?: string;
  }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const params = await searchParams;
  const debts = await listDebts(supabase, user.id);
  const reminders = await listReminderLogsForUser(supabase, user.id);
  const { data: profileData } = await supabase
    .from("profiles")
    .select("default_reminder_enabled, full_name, reminder_tone")
    .eq("id", user.id)
    .maybeSingle();
  const profile = profileData as Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "default_reminder_enabled" | "full_name" | "reminder_tone"
  > | null;
  const activeTab = params.tab ?? "owed_to_me";
  const visibleDebts = searchAndSortDebts(filterDebts(debts, activeTab), {
    search: params.search,
    reminder: params.reminder,
    sort: params.sort,
  });
  const latestReminders = Object.fromEntries(
    reminders.map((reminder) => [
      reminder.debt_id,
      {
        sent_at: reminder.sent_at,
        success: reminder.success,
      },
    ]),
  );

  return (
    <>
      <DashboardPageHeader
        title="Debts"
        description="Add, filter, and manage all money records"
        action={<DebtsPageAction defaultReminderEnabled={profile?.default_reminder_enabled ?? true} />}
      />
      <ToastMessage message={params.toast} type={params.toastType} />
      <div>
        <section className="min-w-0 rounded-lg border bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <h3 className="font-semibold">Debt records</h3>
              <p className="text-xs text-muted">All balances, due dates, and reminder status.</p>
            </div>
            <Link
              href="/dashboard/debts?tab=overdue"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              View overdue
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="border-b px-4 pt-3">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={`/dashboard/debts?tab=${tab.id}`}
                  className={`rounded-t-lg border border-b-0 px-4 py-2 text-sm font-medium ${
                    activeTab === tab.id
                      ? "bg-white text-primary"
                      : "bg-slate-50 text-muted hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            <form className="grid gap-3 py-4 md:grid-cols-[1.5fr_180px_180px]">
              <input type="hidden" name="tab" value={activeTab} />
              <input
                name="search"
                defaultValue={params.search ?? ""}
                placeholder="Search contact, email, or notes"
                className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"
              />
              <select
                name="reminder"
                defaultValue={params.reminder ?? ""}
                className="h-10 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"
              >
                <option value="">All reminder states</option>
                <option value="enabled">Reminder enabled</option>
                <option value="missing_email">Missing email</option>
              </select>
              <div className="flex gap-2">
                <select
                  name="sort"
                  defaultValue={params.sort ?? "due_asc"}
                  className="h-10 min-w-0 flex-1 rounded-lg border bg-white px-3 text-sm outline-none focus:border-primary"
                >
                  <option value="due_asc">Due date</option>
                  <option value="amount_desc">Largest amount</option>
                  <option value="newest">Newest</option>
                </select>
                <button className="rounded-lg bg-primary px-4 text-sm font-semibold text-white">
                  Apply
                </button>
              </div>
            </form>
          </div>

          <div className="p-4">
            {visibleDebts.length ? (
              <DebtTable
                debts={visibleDebts}
                latestReminders={latestReminders}
                reminderTone={(profile?.reminder_tone as "friendly" | "gentle" | "direct" | undefined) ?? "friendly"}
                senderName={profile?.full_name ?? undefined}
              />
            ) : (
              <EmptyState
                title="No debts match this view"
                description="Adjust the search or filters, or add a new debt from the Add debt button."
              />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
