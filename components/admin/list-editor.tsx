"use client";
/**
 * Reusable add/remove list editor used in program and notification forms.
 */
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export function ListEditor({ values, onChange, placeholder = "Add item…" }: Props) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...values, v]);
    setDraft("");
  }

  function update(i: number, v: string) {
    const next = [...values];
    next[i] = v;
    onChange(next);
  }

  function remove(i: number) {
    onChange(values.filter((_, j) => j !== i));
  }

  return (
    <div className="space-y-1.5">
      {values.map((v, i) => (
        <div key={i} className="flex gap-2">
          <input
            value={v}
            onChange={(e) => update(i, e.target.value)}
            className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="p-1.5 rounded shrink-0"
            style={{ color: "var(--color-danger)" }}
            aria-label="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg shrink-0"
          style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
    </div>
  );
}
