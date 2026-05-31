"use client";

import { useTransition } from "react";
import { deleteNotificationAction } from "./actions";

export function DeleteNotificationButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
        startTransition(() => deleteNotificationAction(id));
      }}
      className="text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
      style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
