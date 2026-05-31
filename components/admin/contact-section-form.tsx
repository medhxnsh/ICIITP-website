"use client";
/**
 * Admin form for editing the Contact page content section.
 * Submits to saveContactSectionAction.
 */
import { useTransition, useState } from "react";

interface ContactCurrent {
  address: string;
  enquiries_name: string;
  enquiries_phone: string;
  incubation_name: string;
  incubation_phone: string;
  email: string;
  hours: string;
  maps_embed_url: string;
}

interface Props {
  current: ContactCurrent;
  onSave: (fd: FormData) => Promise<{ success: boolean; error?: string }>;
}

function Field({ label, name, value, type = "text", hint }: { label: string; name: string; value: string; type?: string; hint?: string }) {
  const isTextarea = type === "textarea";
  return (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: "var(--color-brand-950)" }}>{label}</label>
      {hint && <p className="text-xs mb-1.5" style={{ color: "var(--color-text-secondary)" }}>{hint}</p>}
      {isTextarea ? (
        <textarea
          name={name}
          defaultValue={value}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ borderColor: "var(--color-input-border)" }}
        />
      ) : (
        <input
          name={name}
          type="text"
          defaultValue={value}
          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ borderColor: "var(--color-input-border)" }}
        />
      )}
    </div>
  );
}

export function ContactSectionForm({ current, onSave }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await onSave(fd);
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(res.error ?? "Save failed");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field label="Address" name="address" value={current.address} type="textarea"
        hint="Use line breaks for multi-line address." />

      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-brand-950)" }}>General Enquiries</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact name" name="enquiries_name" value={current.enquiries_name} />
          <Field label="Phone number" name="enquiries_phone" value={current.enquiries_phone} />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-brand-950)" }}>For Getting Incubated</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Contact name" name="incubation_name" value={current.incubation_name} />
          <Field label="Phone number" name="incubation_phone" value={current.incubation_phone} />
        </div>
      </div>

      <Field label="Email" name="email" value={current.email} />
      <Field label="Office Hours" name="hours" value={current.hours} />
      <Field label="Google Maps Embed URL" name="maps_embed_url" value={current.maps_embed_url}
        hint="Paste the full src URL from a Google Maps embed iframe." />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm font-medium" style={{ color: "var(--color-brand-800)" }}>✓ Saved — changes are live.</p>}

      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: "var(--color-brand-800)" }}
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
