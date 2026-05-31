"use client";

import { useState, useTransition } from "react";
import { updateStatusDirect } from "@/app/actions/submit";
import { useToast } from "@/components/admin/toast-provider";

type Status = "pending" | "reviewing" | "accepted" | "rejected";

const STATUS_OPTIONS: Status[] = ["pending", "reviewing", "accepted", "rejected"];

export function StatusUpdater({
  id,
  submissionType,
  currentStatus,
}: {
  id: string;
  submissionType: string;
  currentStatus: Status;
}) {
  const [selected, setSelected] = useState<Status>(currentStatus);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function handleUpdate() {
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.set("id", id);
        fd.set("type", submissionType);
        fd.set("status", selected);
        await updateStatusDirect(fd);
        toast.success("Status updated", `Marked as ${selected}.`);
      } catch {
        toast.error("Update failed", "Could not update status. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as Status)}
        disabled={pending}
        className="text-xs rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-[--color-brand-500] disabled:opacity-50"
        style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <button
        type="button"
        onClick={handleUpdate}
        disabled={pending}
        className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 transition-opacity"
        style={{ backgroundColor: "var(--color-brand-800)" }}
      >
        {pending ? "Saving…" : "Update status"}
      </button>
    </div>
  );
}
