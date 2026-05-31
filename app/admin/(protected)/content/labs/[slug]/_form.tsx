"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateLabAction } from "../actions";
import type { CmsLab } from "@/lib/cms/labs";
import { Loader2 } from "lucide-react";

interface Props { lab: CmsLab }

export function LabEditForm({ lab }: Props) {
  const router = useRouter();
  const boundAction = updateLabAction.bind(null, lab.slug);
  const [state, action, pending] = useActionState(boundAction, null);

  useEffect(() => {
    if (state && !state.error) router.push("/admin/content/labs");
  }, [state, router]);

  return (
    <form action={action} className="space-y-5 bg-white rounded-2xl border p-6" style={{ borderColor: "#dde6d0" }}>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Title <span aria-hidden="true" style={{ color: "var(--color-danger)" }}>*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          defaultValue={lab.title}
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ border: "1.5px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Tagline
        </label>
        <textarea
          name="tagline"
          rows={2}
          defaultValue={lab.tagline ?? ""}
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none resize-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ border: "1.5px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
          placeholder="One-line description shown on cards and lists."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Description
        </label>
        <textarea
          name="description"
          rows={4}
          defaultValue={lab.description ?? ""}
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none resize-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ border: "1.5px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
          placeholder="Longer description shown on the lab detail page."
        />
      </div>

      {state?.error && (
        <p className="text-sm rounded-lg px-3.5 py-2.5" style={{ backgroundColor: "var(--color-danger-bg)", color: "#991b1b" }}>
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-lg disabled:opacity-60"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          {pending ? "Saving…" : "Save changes"}
        </button>
        <a
          href="/admin/content/labs"
          className="px-5 py-2.5 text-sm font-medium rounded-lg border"
          style={{ borderColor: "var(--color-input-border)", color: "var(--color-text-body)" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
