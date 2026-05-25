import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  HandCoins,
  Mail,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const steps = [
  ["Write one sentence", "Ram owes me 2500 in 7 days becomes a clean debt record."],
  ["Confirm the preview", "Asti Ko Paisa shows the name, amount, direction, and due date before saving."],
  ["Send a gentle nudge", "Manual and scheduled emails keep follow-ups polite."],
];

const features = [
  {
    icon: HandCoins,
    title: "Two-way tracking",
    text: "Separate money owed to you from money you owe others.",
  },
  {
    icon: CalendarClock,
    title: "Due-date memory",
    text: "See upcoming, due today, and overdue balances without noise.",
  },
  {
    icon: Mail,
    title: "Polite reminders",
    text: "Send warm email reminders without rewriting awkward messages.",
  },
  {
    icon: CheckCircle2,
    title: "Partial payments",
    text: "Record small repayments and keep the remaining amount accurate.",
  },
];

const faqs = [
  ["Is Asti Ko Paisa a banking app?", "No. Asti Ko Paisa is for personal debt notes and reminders."],
  ["Does Asti Ko Paisa collect money?", "No. There are no payment gateways or collection tools."],
  ["Can I use Google login?", "Yes. Google sign-in works through Supabase Auth."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfbf7] text-[#111815]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Link href="/" className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#111815] text-white">
            <WalletCards className="h-5 w-5" />
          </span>
          <span className="leading-none">
            Asti Ko Paisa
            <span className="block text-[10px] font-medium text-muted">money notes</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-[#313934] md:flex">
          <a href="#features">Features</a>
          <a href="#flow">Flow</a>
          <a href="#why">Why Asti Ko Paisa</a>
          <a href="#faq">FAQ</a>
        </nav>
        <Link
          href="/auth/login"
          className={cn(buttonVariants({ variant: "primary", size: "sm" }), "rounded-full px-5")}
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-12 pt-20">
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Stop forgetting who owes what.
            <span className="block text-primary">Keep it kind.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-base leading-8 text-[#3d4a43]">
            Asti Ko Paisa turns casual money conversations into simple records, due dates, payment history,
            and polite reminders, without making it feel like a bank app.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/login"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "rounded-full px-6")}
            >
              Start with Google
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#flow"
              className="inline-flex h-13 items-center gap-2 rounded-full border bg-white px-6 text-base font-bold shadow-sm hover:bg-emerald-50"
            >
              See the flow
            </a>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted">
            {["No awkward chasing", "Email reminders", "Private by user", "Partial payments"].map(
              (item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
            Clear record · gentle reminder
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
            One place for every IOU.
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted">
            Track both sides of social money, remember due dates, and follow up without sounding
            harsh.
          </p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="group p-5 hover:-translate-y-1 duration-300 hover:border-primary/40 hover:shadow-xl"
            >
              <span className="flex h-11 w-11 items-center justify-center duration-300 rounded-xl bg-emerald-50 text-primary group-hover:bg-primary group-hover:text-white">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-base font-bold">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{feature.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="flow" className="border-y bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
              The Asti Ko Paisa flow
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              From a sentence to a reminder trail.
            </h2>
            <p className="mt-5 leading-7 text-muted">
              Asti Ko Paisa keeps the workflow short: write naturally, confirm, save, and follow the balance
              until it is paid.
            </p>
          </div>
          <div className="grid gap-4">
            {steps.map(([title, text], index) => (
              <div
                key={title}
                className="group flex gap-4 rounded-2xl border bg-[#fbfbf7] p-5 hover:border-primary/50 hover:bg-emerald-50/40"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="why" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted">
              Why Asti Ko Paisa
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
              Built for real friendships, not collections.
            </h2>
            <p className="mt-5 leading-7 text-muted">
              The app keeps the money record serious while the reminder tone stays calm, social, and
              human.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Less awkward follow-up", "Use ready reminder emails instead of typing the same message."],
              ["Balances stay current", "Full and partial payments update the remaining amount."],
              ["No outside payment pressure", "Asti Ko Paisa records money, but does not collect it."],
              ["Private personal records", "Each user only sees their own contacts, debts, and logs."],
            ].map(([title, text]) => (
              <Card key={title} className="p-5">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="relative overflow-hidden rounded-[2rem] border bg-[#101815] p-8 text-white shadow-2xl md:p-12">
          <div className="absolute right-8 top-8 hidden h-48 w-48 rounded-full border border-emerald-400/30 md:block" />
          <div className="absolute right-20 top-20 hidden h-24 w-24 rounded-full border border-emerald-400/50 md:block" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-300">
              Ready when the next IOU happens
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] md:text-5xl">
              Keep the record. Keep the friendship.
            </h2>
            <p className="mt-5 leading-7 text-emerald-50/80">
              Start tracking money conversations with quick entry, payment history, and polite email
              reminders.
            </p>
            <Link
              href="/auth/login"
              className={cn(
                buttonVariants({ variant: "primary", size: "lg" }),
                "mt-8 rounded-full bg-white text-[#101815] hover:bg-emerald-50",
              )}
            >
              Open Asti Ko Paisa
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 pb-20">
        <h2 className="text-4xl font-semibold tracking-[-0.04em]">FAQ</h2>
        <div className="mt-6 space-y-3">
          {faqs.map(([question, answer]) => (
            <Card key={question} className="p-5">
              <h3 className="font-bold">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{answer}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
