"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DebtOverlay } from "@/components/debt/debt-overlay";

export function DebtsPageAction({
  defaultReminderEnabled = true,
}: {
  defaultReminderEnabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add debt</Button>
      <DebtOverlay
        open={open}
        onClose={() => setOpen(false)}
        returnTo="/dashboard/debts"
        defaultReminderEnabled={defaultReminderEnabled}
      />
    </>
  );
}
