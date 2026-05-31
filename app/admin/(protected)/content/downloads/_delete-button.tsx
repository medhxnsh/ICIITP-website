"use client";

import { useTransition } from "react";
import { deleteDownloadAction } from "./actions";

export function DeleteDownloadButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete "${title}"?`)) return;
        startTransition(() => deleteDownloadAction(id));
      }}
      className="text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
      style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)" }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
