"use client";

import { useState } from "react";
import { Bell, PencilLine } from "lucide-react";
import { ContactEditDialog } from "@/components/debt/contact-edit-dialog";
import { ReminderPreviewDialog } from "@/components/debt/reminder-preview-dialog";
import { Button } from "@/components/ui/button";
import type { DebtWithContact } from "@/types/database";

export function DebtDetailActions({
  debt,
  reminderTone,
  senderName,
  showEdit = true,
}: {
  debt: DebtWithContact;
  reminderTone: "friendly" | "gentle" | "direct";
  senderName?: string;
  showEdit?: boolean;
}) {
  const [contactOpen, setContactOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {showEdit ? (
          <Button type="button" variant="secondary" size="sm" onClick={() => setContactOpen(true)}>
            <PencilLine className="h-4 w-4" />
            Edit contact
          </Button>
        ) : null}
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={!debt.contacts?.email || debt.status === "paid"}
          onClick={() => setPreviewOpen(true)}
        >
          <Bell className="h-4 w-4" />
          Preview reminder
        </Button>
      </div>

      <ContactEditDialog
        debt={debt}
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        returnTo={`/dashboard/debts/${debt.id}`}
      />
      <ReminderPreviewDialog
        debt={debt}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        returnTo={`/dashboard/debts/${debt.id}`}
        tone={reminderTone}
        senderName={senderName}
      />
    </>
  );
}
