"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export function ToastMessage({
  message,
  type = "success",
}: {
  message?: string;
  type?: "success" | "error";
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setVisible(false), 4200);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  return (
    <div className="fixed right-4 top-20 z-[120] w-full max-w-sm rounded-xl border bg-white p-4 shadow-[0_18px_60px_rgba(17,24,21,0.18)]">
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            type === "error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-primary"
          }`}
        >
          {type === "error" ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {type === "error" ? "Something needs attention" : "Done"}
          </p>
          <p className="mt-1 text-sm text-muted">{message}</p>
        </div>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
