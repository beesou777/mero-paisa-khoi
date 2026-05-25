import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { createSupabaseServerClient } from "@/lib/db/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return <AppShell email={user.email}>{children}</AppShell>;
}
