import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getServerEnv } from "@/lib/validations/env";

export function createSupabaseAdminClient() {
  const env = getServerEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for scheduled reminders.");
  }

  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
      },
    },
  );
}
