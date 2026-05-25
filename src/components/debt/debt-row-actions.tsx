"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, CheckCircle2, Eye, MoreVertical, PencilLine, Wallet, X } from "lucide-react";
import {
  addPaymentAction,
  markPaidAction,
} from "@/features/debt/actions";
import { ContactEditDialog } from "@/components/debt/contact-edit-dialog";
import { ReminderPreviewDialog } from "@/components/debt/reminder-preview-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { DebtWithContact } from "@/types/database";

type Position = {
  top: number;
  left: number;
};

export function DebtRowActions({
  debt,
  reminderTone = "friendly",
  senderName,
}: {
  debt: DebtWithContact;
  reminderTone?: "friendly" | "gentle" | "direct";
  senderName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isPaid = debt.status === "paid" || debt.remaining_amount <= 0;
  const canRemind = Boolean(debt.contacts?.email);

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(12, rect.right - 220),
      });
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
        aria-label="Open debt actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[80] w-[220px] rounded-xl border bg-white p-2 text-left shadow-[0_18px_60px_rgba(17,24,21,0.18)]"
              style={{ top: position.top, left: position.left }}
            >
              <Link
                href={`/dashboard/debts/${debt.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                View detail
              </Link>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setPaymentOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                <Wallet className="h-4 w-4" />
                Add payment
              </button>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setContactOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                <PencilLine className="h-4 w-4" />
                Edit contact
              </button>

              <form action={markPaidAction}>
                <input type="hidden" name="debtId" value={debt.id} />
                <input type="hidden" name="returnTo" value="/dashboard/debts" />
                <SubmitButton
                  type="submit"
                  variant="ghost"
                  size="sm"
                  pendingText="Saving..."
                  disabled={isPaid}
                  className="flex h-auto w-full justify-start rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-emerald-50"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Mark paid
                </SubmitButton>
              </form>

              <button
                type="button"
                disabled={!canRemind || isPaid}
                onClick={() => {
                  setOpen(false);
                  setPreviewOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-emerald-50 disabled:pointer-events-none disabled:opacity-50"
              >
                <Bell className="h-4 w-4 text-primary" />
                Send reminder
              </button>
              {!canRemind ? (
                <p className="px-3 py-2 text-xs text-muted">
                  Add an email to this contact before sending reminders.
                </p>
              ) : null}
            </div>,
            document.body,
          )
        : null}

      {paymentOpen
        ? createPortal(
            <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#101815]/55 p-4 backdrop-blur-sm">
              <div
                className="absolute inset-0"
                onClick={() => setPaymentOpen(false)}
              />
              <div className="relative z-10 w-full max-w-md rounded-2xl border bg-white p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">Add payment</h3>
                    <p className="mt-1 text-sm text-muted">
                      Record a full or partial payment for {debt.contacts?.name ?? "this debt"}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
                    aria-label="Close payment dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form action={addPaymentAction} className="mt-5 space-y-4">
                  <input type="hidden" name="debtId" value={debt.id} />
                  <input type="hidden" name="returnTo" value="/dashboard/debts" />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      name="amount"
                      type="number"
                      min="1"
                      max={debt.remaining_amount}
                      step="0.01"
                      placeholder="1500"
                      disabled={isPaid}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Note</label>
                    <Input name="note" placeholder="Cash, bank transfer, split payment..." />
                  </div>
                  <div className="flex gap-2">
                    <SubmitButton disabled={isPaid} pendingText="Saving payment...">
                      <Wallet className="h-4 w-4" />
                      Save payment
                    </SubmitButton>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setPaymentOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}

      <ContactEditDialog
        debt={debt}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        returnTo="/dashboard/debts"
      />
      <ReminderPreviewDialog
        debt={debt}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        returnTo="/dashboard/debts"
        tone={reminderTone}
        senderName={senderName}
      />
    </>
  );
}
