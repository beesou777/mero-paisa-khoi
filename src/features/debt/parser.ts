import { addDays, formatISO, parseISO, startOfDay } from "date-fns";
import type { DebtDirection } from "@/types/database";
import type { ParsedDebtInput } from "@/lib/validations/debt";

const amountPattern = /(?:rs\.?|npr|rupees?)?\s*([\d,]+(?:\.\d{1,2})?)/i;
const owedToMePattern =
  /^\s*([a-zA-Z][a-zA-Z\s.'-]{1,60})\s+owes\s+me\s+(.+)$/i;
const iOwePattern =
  /^\s*i\s+owe\s+([a-zA-Z][a-zA-Z\s.'-]{1,60})\s+(.+)$/i;
const weekdays: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

function parseDueDate(text: string, now = new Date()) {
  const lower = text.toLowerCase();
  const today = startOfDay(now);

  if (/\btoday\b/.test(lower)) return today;
  if (/\btomorrow\b/.test(lower)) return addDays(today, 1);

  const inDays = lower.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDays) return addDays(today, Number(inDays[1]));

  const weekdayMatch = lower.match(
    /\b(?:by\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/,
  );
  if (weekdayMatch) {
    const targetDay = weekdays[weekdayMatch[1]];
    const currentDay = today.getDay();
    const daysUntil = (targetDay - currentDay + 7) % 7 || 7;
    return addDays(today, daysUntil);
  }

  const iso = lower.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso) return parseISO(iso[1]);

  return null;
}

function parseDirection(input: string):
  | { direction: DebtDirection; contactName: string; rest: string }
  | null {
  const owedToMe = input.match(owedToMePattern);
  if (owedToMe) {
    return {
      direction: "owed_to_me",
      contactName: owedToMe[1].trim(),
      rest: owedToMe[2],
    };
  }

  const iOwe = input.match(iOwePattern);
  if (iOwe) {
    return {
      direction: "i_owe",
      contactName: iOwe[1].trim(),
      rest: iOwe[2],
    };
  }

  return null;
}

export function parseDebtSentence(input: string, now = new Date()): ParsedDebtInput | null {
  const directionMatch = parseDirection(input);
  if (!directionMatch) return null;

  const amountMatch = directionMatch.rest.match(amountPattern);
  const dueDate = parseDueDate(directionMatch.rest, now);
  if (!amountMatch || !dueDate) return null;

  return {
    contactName: directionMatch.contactName,
    amount: Number(amountMatch[1].replace(/,/g, "")),
    dueDate: formatISO(dueDate, { representation: "date" }),
    direction: directionMatch.direction,
    originalInput: input.trim(),
  };
}
