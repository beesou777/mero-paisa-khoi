import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/db/admin";
import { getServerEnv } from "@/lib/validations/env";
import { getScheduledReminderType, sendDebtReminder } from "@/server/services/reminders";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const env = getServerEnv();
  const auth = request.headers.get("authorization");
  if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("debts")
    .select("*, contacts(*)")
    .neq("status", "paid")
    .eq("reminder_enabled", true);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  for (const debt of data ?? []) {
    const type = getScheduledReminderType(debt);
    if (type) {
      await sendDebtReminder(supabase, debt, type);
      sent += 1;
    }
  }

  return NextResponse.json({ sent });
}
