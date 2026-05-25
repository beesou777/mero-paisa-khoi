"use client";

import { X } from "lucide-react";
import { updateContactAction } from "@/features/debt/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { DebtWithContact } from "@/types/database";

export function ContactEditDialog({
  debt,
  open,
  onClose,
  returnTo,
}: {
  debt: DebtWithContact;
  open: boolean;
  onClose: () => void;
  returnTo: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#101815]/55 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Edit contact</h3>
            <p className="mt-1 text-sm text-muted">
              Update the name or email used for reminders.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
            aria-label="Close contact dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={updateContactAction} className="mt-5 space-y-4">
          <input type="hidden" name="debtId" value={debt.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              name="contactName"
              defaultValue={debt.contacts?.name ?? ""}
              placeholder="Contact name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              defaultValue={debt.contacts?.email ?? ""}
              placeholder="friend@example.com"
            />
          </div>
          <div className="flex gap-2">
            <SubmitButton pendingText="Saving contact...">Save contact</SubmitButton>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
