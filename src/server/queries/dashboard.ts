import { addDays, isAfter, isBefore, isWithinInterval, startOfDay, subDays } from "date-fns";
import type { DebtWithContact } from "@/types/database";

export function getDashboardSummary(debts: DebtWithContact[]) {
  const now = new Date();
  const recentCutoff = subDays(now, 14);

  return {
    owedToMe: debts
      .filter((debt) => debt.direction === "owed_to_me" && debt.status !== "paid")
      .reduce((sum, debt) => sum + debt.remaining_amount, 0),
    iOwe: debts
      .filter((debt) => debt.direction === "i_owe" && debt.status !== "paid")
      .reduce((sum, debt) => sum + debt.remaining_amount, 0),
    overdue: debts
      .filter((debt) => debt.status !== "paid" && isBefore(new Date(debt.due_date), now))
      .reduce((sum, debt) => sum + debt.remaining_amount, 0),
    recentlyPaid: debts
      .filter((debt) => debt.status === "paid" && isAfter(new Date(debt.updated_at), recentCutoff))
      .reduce((sum, debt) => sum + debt.amount, 0),
  };
}

export function filterDebts(debts: DebtWithContact[], tab: string) {
  if (tab === "i_owe") return debts.filter((debt) => debt.direction === "i_owe");
  if (tab === "overdue") return debts.filter((debt) => debt.status === "overdue");
  return debts.filter((debt) => debt.direction === "owed_to_me");
}

export function searchAndSortDebts(
  debts: DebtWithContact[],
  {
    search,
    reminder,
    sort,
  }: {
    search?: string;
    reminder?: string;
    sort?: string;
  },
) {
  let result = debts;

  if (search) {
    const query = search.toLowerCase();
    result = result.filter((debt) => {
      const name = debt.contacts?.name?.toLowerCase() ?? "";
      const email = debt.contacts?.email?.toLowerCase() ?? "";
      const notes = debt.notes?.toLowerCase() ?? "";
      return name.includes(query) || email.includes(query) || notes.includes(query);
    });
  }

  if (reminder === "enabled") {
    result = result.filter((debt) => debt.reminder_enabled);
  } else if (reminder === "missing_email") {
    result = result.filter((debt) => !debt.contacts?.email);
  }

  if (sort === "amount_desc") {
    result = [...result].sort((a, b) => b.remaining_amount - a.remaining_amount);
  } else if (sort === "newest") {
    result = [...result].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } else {
    result = [...result].sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
    );
  }

  return result;
}

export function getUpcomingDebts(debts: DebtWithContact[], days = 7) {
  const today = startOfDay(new Date());
  const end = addDays(today, days);

  return debts.filter(
    (debt) =>
      debt.status !== "paid" &&
      isWithinInterval(new Date(debt.due_date), {
        start: today,
        end,
      }),
  );
}

export function getLargestBalances(debts: DebtWithContact[], limit = 4) {
  return [...debts]
    .filter((debt) => debt.status !== "paid")
    .sort((a, b) => b.remaining_amount - a.remaining_amount)
    .slice(0, limit);
}

export function getTopContacts(debts: DebtWithContact[], limit = 4) {
  const grouped = new Map<
    string,
    { name: string; count: number; balance: number; direction: "owed_to_me" | "i_owe" | "mixed" }
  >();

  for (const debt of debts.filter((item) => item.status !== "paid")) {
    const key = debt.contact_id;
    const existing = grouped.get(key);
    const nextDirection =
      !existing
        ? debt.direction
        : existing.direction === debt.direction
          ? existing.direction
          : "mixed";

    grouped.set(key, {
      name: debt.contacts?.name ?? "Unknown",
      count: (existing?.count ?? 0) + 1,
      balance: (existing?.balance ?? 0) + debt.remaining_amount,
      direction: nextDirection,
    });
  }

  return [...grouped.values()]
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
}
