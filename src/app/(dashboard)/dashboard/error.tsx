"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-lg p-6">
        <h1 className="font-heading text-2xl font-bold">Something needs attention</h1>
        <p className="mt-2 text-sm text-muted">{error.message}</p>
        <div className="mt-5 flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Link href="/" className="rounded-lg bg-white px-5 py-2.5 text-sm font-bold">
            Home
          </Link>
        </div>
      </Card>
    </main>
  );
}
