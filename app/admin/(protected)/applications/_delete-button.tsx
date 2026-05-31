"use client";

import { useTransition } from "react";
import { deleteSubmissionDirect } from "@/app/actions/submit";
import { useToast } from "@/components/admin/toast-provider";

export function DeleteApplicationButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleClick() {
    if (!confirm("Permanently delete this application? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", id);
        await deleteSubmissionDirect(fd);
        toast.warning("Application deleted", "The submission has been permanently removed.");
      } catch {
        toast.error("Delete failed", "Could not delete the application. Please try again.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={handleClick}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
      style={{ color: "var(--color-danger)", border: "1px solid var(--color-danger)", backgroundColor: "var(--color-danger-bg)" }}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
