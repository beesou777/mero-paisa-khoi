"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenCheck,
  CircleDollarSign,
  Gauge,
  LogOut,
  Mail,
  Settings,
  UserRound,
  WalletCards,
} from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Debts", href: "/dashboard/debts", icon: BookOpenCheck },
  { label: "Payments", href: "/dashboard/payments", icon: CircleDollarSign },
  { label: "Reminder Mail", href: "/dashboard/reminders", icon: Mail },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const pageMeta = [
  {
    match: (pathname: string) => pathname.startsWith("/dashboard/debts/"),
    active: "Debts",
    title: "Debt detail",
    description: "Review payments, reminders, and activity for one record",
  },
  {
    match: (pathname: string) => pathname.startsWith("/dashboard/debts"),
    active: "Debts",
    title: "Debts",
    description: "Add, filter, and manage all money records",
  },
  {
    match: (pathname: string) => pathname.startsWith("/dashboard/payments"),
    active: "Payments",
    title: "Payments",
    description: "Review full and partial payments recorded in Asti Ko Paisa",
  },
  {
    match: (pathname: string) => pathname.startsWith("/dashboard/reminders"),
    active: "Reminder Mail",
    title: "Reminder Mail",
    description: "Track reminder emails sent manually or by schedule",
  },
  {
    match: (pathname: string) => pathname.startsWith("/dashboard/settings"),
    active: "Settings",
    title: "Settings",
    description: "Profile and default debt preferences",
  },
];

export function AppShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string | null;
}) {
  const pathname = usePathname();
  const meta =
    pageMeta.find((item) => item.match(pathname)) ?? {
      active: "Dashboard",
      title: "Dashboard",
      description: "Overview of your active debts and reminders",
    };
  const { active, title, description } = meta;

  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden border-r bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <WalletCards className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-bold leading-none">Asti Ko Paisa</p>
            <p className="text-xs text-muted">Debt reminders</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                item.label === active
                  ? "bg-emerald-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="m-3 rounded-lg border bg-slate-50 p-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold">
              <UserRound className="h-4 w-4 text-muted" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Account</p>
              <p className="truncate text-xs text-muted">{email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold">{title}</h1>
              <p className="hidden text-xs text-muted sm:block">
                {description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/settings">
              <Button variant="secondary" size="icon" aria-label="Settings">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <form action={signOut}>
              <Button variant="secondary" size="sm">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          </div>
        </header>

        <main className="p-3 pb-24 sm:p-4 sm:pb-24 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-semibold ${
                item.label === active
                  ? "bg-emerald-50 text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-foreground"
              }`}
            >
              <item.icon className="mb-1 h-4 w-4" />
              <span className="truncate">{item.label.replace("Reminder Mail", "Reminders")}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
