"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Check, Mail, PencilLine, X } from "lucide-react";
import { parseDebtSentence } from "@/features/debt/parser";
import { createDebtAction } from "@/features/debt/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { formatMoney } from "@/lib/utils";

export function DebtOverlay({
  open,
  onClose,
  returnTo = "/dashboard/debts",
  defaultReminderEnabled = true,
}: {
  open: boolean;
  onClose: () => void;
  returnTo?: string;
  defaultReminderEnabled?: boolean;
}) {
  const [sentence, setSentence] = useState("Ram owes me 2500 in 7 days");
  const [manual, setManual] = useState(false);
  const parsed = parseDebtSentence(sentence);
  const showManual = manual || !parsed;
  const showHint = sentence.trim().length > 0 && !parsed && !manual;

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101815]/55 p-4 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <Card className="relative z-10 w-full max-w-2xl overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-start justify-between border-b bg-slate-50">
          <div>
            <CardTitle>Add debt</CardTitle>
            <p className="mt-1 text-sm text-muted">
              Enter it naturally or switch to manual details.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white"
            aria-label="Close add debt dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="space-y-2">
            <Label htmlFor="sentence">Natural sentence</Label>
            <Input
              id="sentence"
              value={sentence}
              onChange={(event) => {
                setSentence(event.target.value);
                setManual(false);
              }}
              placeholder="Sita owes me 3000 by Friday"
            />
            {showHint ? (
              <p className="text-sm text-rose-700">
                Could not detect the full debt details yet. Try an example below or switch to manual.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "Ram owes me 2500 in 7 days",
                  "I owe Hari 1500 tomorrow",
                  "Sita owes me 3000 by Friday",
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setSentence(example);
                      setManual(false);
                    }}
                    className="rounded-full border bg-white px-3 py-1.5 text-xs font-semibold hover:border-primary hover:bg-emerald-50"
                  >
                    {example}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!showManual && parsed ? (
            <form action={createDebtAction} className="space-y-4 rounded-lg border bg-emerald-50 p-4">
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="contactName" value={parsed.contactName} />
              <input type="hidden" name="amount" value={parsed.amount} />
              <input type="hidden" name="dueDate" value={parsed.dueDate} />
              <input type="hidden" name="direction" value={parsed.direction} />
              <input type="hidden" name="originalInput" value={parsed.originalInput} />
              <div className="grid gap-3 sm:grid-cols-3">
                <PreviewItem label="Who" value={parsed.contactName} />
                <PreviewItem label="Amount" value={formatMoney(parsed.amount)} />
                <PreviewItem label="Due" value={new Date(parsed.dueDate).toLocaleDateString()} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email optional</Label>
                  <Input id="email" name="email" type="email" placeholder="friend@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes optional</Label>
                  <Input id="notes" name="notes" placeholder="Lunch, rent, groceries..." />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input name="reminderEnabled" type="checkbox" defaultChecked={defaultReminderEnabled} />
                Enable polite email reminders
              </label>
              <div className="flex flex-wrap gap-2">
                <SubmitButton pendingText="Saving debt...">
                  <Check className="h-4 w-4" />
                  Confirm and save
                </SubmitButton>
                <Button type="button" variant="secondary" onClick={() => setManual(true)}>
                  <PencilLine className="h-4 w-4" />
                  Edit manually
                </Button>
              </div>
            </form>
          ) : (
            <ManualDebtForm
              sentence={sentence}
              returnTo={returnTo}
              defaultReminderEnabled={defaultReminderEnabled}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}

function ManualDebtForm({
  sentence,
  returnTo,
  defaultReminderEnabled,
}: {
  sentence: string;
  returnTo: string;
  defaultReminderEnabled: boolean;
}) {
  return (
    <form action={createDebtAction} className="space-y-4 rounded-lg border bg-slate-50 p-4">
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="originalInput" value={sentence} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Who?</Label>
          <Input name="contactName" placeholder="Hari" required />
        </div>
        <div className="space-y-2">
          <Label>Direction</Label>
          <select
            name="direction"
            className="h-10 w-full rounded-lg border bg-white px-3 text-sm font-medium outline-none"
            defaultValue="owed_to_me"
          >
            <option value="owed_to_me">They owe me</option>
            <option value="i_owe">I owe them</option>
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input name="amount" type="number" min="1" step="0.01" placeholder="2500" required />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Due date
          </Label>
          <Input name="dueDate" type="date" required />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email optional
          </Label>
          <Input name="email" type="email" placeholder="friend@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea name="notes" placeholder="What was this for?" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input name="reminderEnabled" type="checkbox" defaultChecked={defaultReminderEnabled} />
        Enable polite email reminders
      </label>
      <SubmitButton pendingText="Saving debt...">Save debt</SubmitButton>
    </form>
  );
}
