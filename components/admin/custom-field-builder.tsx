"use client";
/**
 * Drag-and-drop custom field builder used in the event creation/edit form.
 * Supports text, textarea, url, date, image, and list field types.
 */
import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Upload } from "lucide-react";
import type { CustomField, FieldType } from "@/lib/cms/events";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text (single line)" },
  { value: "textarea", label: "Text (multi-line)" },
  { value: "url", label: "URL / Link" },
  { value: "date", label: "Date" },
  { value: "image", label: "Image" },
  { value: "list", label: "Bullet list" },
];

const FIELD_TYPE_COLORS: Record<FieldType, string> = {
  text: "#1d4ed8",
  textarea: "#7c3aed",
  url: "#0284c7",
  date: "#b45309",
  image: "#15803d",
  list: "var(--color-danger)",
};

interface Props {
  fields: CustomField[];
  onChange: (fields: CustomField[]) => void;
  eventSlug: string;
}

export function CustomFieldBuilder({ fields, onChange, eventSlug }: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);

  function addField() {
    const id = crypto.randomUUID();
    const next: CustomField = {
      id,
      label: "",
      description: "",
      type: "text",
      value: "",
      items: [],
      order: fields.length,
    };
    onChange([...fields, next]);
    setEditingId(id);
    setAdding(false);
  }

  function updateField(id: string, patch: Partial<CustomField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeField(id: string) {
    onChange(fields.filter((f) => f.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function move(id: string, dir: -1 | 1) {
    const idx = fields.findIndex((f) => f.id === id);
    if (idx + dir < 0 || idx + dir >= fields.length) return;
    const next = [...fields];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    onChange(next.map((f, i) => ({ ...f, order: i })));
  }

  async function uploadImage(fieldId: string, file: File) {
    setUploading(fieldId);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("path", `events/fields/${eventSlug || "draft"}-${fieldId}-${Date.now()}`);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const { url } = await res.json();
      if (url) updateField(fieldId, { value: url });
    } finally {
      setUploading(null);
    }
  }

  const sorted = [...fields].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-3">
      {sorted.length === 0 && (
        <p className="text-sm py-6 text-center rounded-xl" style={{ color: "var(--color-text-secondary)", border: "1.5px dashed #d4e6c4" }}>
          No custom fields yet. Add sections like Prize Money, Schedule, Eligibility…
        </p>
      )}

      {sorted.map((field, idx) => {
        const isEditing = editingId === field.id;
        return (
          <div
            key={field.id}
            className="rounded-xl bg-white"
            style={{ border: "1px solid var(--color-border-subtle)" }}
          >
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0 text-white"
                style={{ backgroundColor: FIELD_TYPE_COLORS[field.type] }}
              >
                {field.type}
              </span>
              <span className="flex-1 text-sm font-medium truncate" style={{ color: "var(--color-brand-950)" }}>
                {field.label || <span style={{ color: "var(--color-placeholder)" }}>Untitled field</span>}
              </span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(field.id, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded disabled:opacity-30"
                  style={{ color: "var(--color-text-secondary)" }}
                  aria-label="Move up"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(field.id, 1)}
                  disabled={idx === sorted.length - 1}
                  className="p-1 rounded disabled:opacity-30"
                  style={{ color: "var(--color-text-secondary)" }}
                  aria-label="Move down"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(isEditing ? null : field.id)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg"
                  style={isEditing
                    ? { backgroundColor: "var(--color-brand-800)", color: "white" }
                    : { backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
                >
                  {isEditing ? "Done" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={() => removeField(field.id)}
                  className="p-1 rounded"
                  style={{ color: "var(--color-danger)" }}
                  aria-label="Delete field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Edit panel */}
            {isEditing && (
              <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid #f0f7e6" }}>
                <div className="grid sm:grid-cols-2 gap-3 pt-3">
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-body)" }}>
                      Label <span style={{ color: "var(--color-danger)" }}>*</span>
                    </label>
                    <input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="e.g. Prize Money"
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
                      style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-body)" }}>
                      Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateField(field.id, {
                          type: e.target.value as FieldType,
                          value: "",
                          items: [],
                        })
                      }
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
                      style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-body)" }}>
                    Admin description (optional help text, not shown on site)
                  </label>
                  <input
                    value={field.description}
                    onChange={(e) => updateField(field.id, { description: e.target.value })}
                    placeholder="Remind yourself what goes here"
                    className="w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
                    style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                  />
                </div>

                {/* Value editor per type */}
                {field.type === "list" ? (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-body)" }}>
                      List items
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {field.items.map((item, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={item}
                            onChange={(e) => {
                              const next = [...field.items];
                              next[i] = e.target.value;
                              updateField(field.id, { items: next });
                            }}
                            className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
                            style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const next = field.items.filter((_, j) => j !== i);
                              updateField(field.id, { items: next });
                            }}
                            className="p-1.5 rounded"
                            style={{ color: "var(--color-danger)" }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newItem.trim()) {
                              updateField(field.id, { items: [...field.items, newItem.trim()] });
                              setNewItem("");
                            }
                          }
                        }}
                        placeholder="Add item (Enter to add)"
                        className="flex-1 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
                        style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newItem.trim()) {
                            updateField(field.id, { items: [...field.items, newItem.trim()] });
                            setNewItem("");
                          }
                        }}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : field.type === "image" ? (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-body)" }}>
                      Image
                    </label>
                    {field.value && (
                      <img
                        src={field.value}
                        alt="Field preview"
                        className="w-full max-h-48 object-cover rounded-lg mb-2"
                      />
                    )}
                    <label
                      className="flex items-center gap-2 cursor-pointer text-sm px-3 py-2 rounded-lg w-fit"
                      style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {uploading === field.id ? "Uploading…" : field.value ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploading === field.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(field.id, file);
                        }}
                      />
                    </label>
                    {field.value && (
                      <input
                        value={field.value}
                        onChange={(e) => updateField(field.id, { value: e.target.value })}
                        placeholder="or paste image URL"
                        className="mt-2 w-full text-xs rounded-lg px-3 py-2 outline-none font-mono focus:ring-2 focus:ring-[--color-brand-500]"
                        style={{ border: "1px solid var(--color-input-border)", color: "var(--color-text-body)" }}
                      />
                    )}
                  </div>
                ) : field.type === "textarea" ? (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-body)" }}>
                      Content
                    </label>
                    <textarea
                      value={field.value}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      rows={4}
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none resize-y focus:ring-2 focus:ring-[--color-brand-500]"
                      style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-text-body)" }}>
                      {field.type === "url" ? "URL" : field.type === "date" ? "Date" : "Value"}
                    </label>
                    <input
                      type={field.type === "date" ? "date" : field.type === "url" ? "url" : "text"}
                      value={field.value}
                      onChange={(e) => updateField(field.id, { value: e.target.value })}
                      className="w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[--color-brand-500]"
                      style={{ border: "1px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addField}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl w-full justify-center transition-colors"
        style={{ border: "1.5px dashed #b8d4a0", color: "var(--color-brand-800)" }}
      >
        <Plus className="w-4 h-4" />
        Add custom field
      </button>
    </div>
  );
}
