"use client";

import { X } from "lucide-react";
import { renderReminderEmail } from "@/features/reminder/email-templates";
import { sendReminderAction } from "@/features/debt/actions";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import type { DebtWithContact } from "@/types/database";

type ReminderTone = "friendly" | "gentle" | "direct";

export function ReminderPreviewDialog({
  debt,
  open,
  onClose,
  returnTo,
  tone,
  senderName,
}: {
  debt: DebtWithContact;
  open: boolean;
  onClose: () => void;
  returnTo: string;
  tone: ReminderTone;
  senderName?: string;
}) {
  if (!open) return null;

  const preview = renderReminderEmail("manual", debt, {
    tone,
    senderName,
  });

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#101815]/55 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl rounded-2xl border bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Reminder preview</h3>
            <p className="mt-1 text-sm text-muted">
              Check the subject and message before sending.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100"
            aria-label="Close reminder preview"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 rounded-2xl border bg-slate-50 p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold">{preview.subject}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              Message
            </p>
            <div className="mt-2 space-y-2 rounded-xl border bg-white p-4 text-sm leading-6 text-slate-700">
              {preview.text.split("\n").map((line, index) => (
                <p key={`${line}-${index}`}>{line || "\u00A0"}</p>
              ))}
            </div>
          </div>
        </div>

        <form action={sendReminderAction} className="mt-5 flex gap-2">
          <input type="hidden" name="debtId" value={debt.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <SubmitButton pendingText="Sending...">Send reminder</SubmitButton>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
}
