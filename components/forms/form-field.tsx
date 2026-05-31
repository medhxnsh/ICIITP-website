"use client";

import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";

const base = "w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[--color-brand-500]";
const style = { border: "1.5px solid var(--color-input-border)", backgroundColor: "white", color: "var(--color-brand-950)" };

function focusHandlers(el: HTMLElement | null) {
  if (!el) return {};
  return {
    onFocus: () => { el.style.boxShadow = "0 0 0 3px #3a521420"; el.style.borderColor = "var(--color-brand-800)"; },
    onBlur: () => { el.style.boxShadow = "none"; el.style.borderColor = "var(--color-input-border)"; },
  };
}

export function Label({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold mb-1.5" style={{ color: "var(--color-brand-950)" }}>
      {children}{required && <span className="ml-0.5" style={{ color: "#c0392b" }} aria-hidden>*</span>}
    </label>
  );
}

export function Input({ id, required, ...props }: InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  return (
    <input
      id={id}
      name={id}
      required={required}
      className={base}
      style={style}
      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420"; e.currentTarget.style.borderColor = "var(--color-brand-800)"; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--color-input-border)"; }}
      {...props}
    />
  );
}

export function Textarea({ id, required, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string }) {
  return (
    <textarea
      id={id}
      name={id}
      required={required}
      rows={rows}
      className={`${base} resize-y`}
      style={style}
      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420"; e.currentTarget.style.borderColor = "var(--color-brand-800)"; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--color-input-border)"; }}
      {...props}
    />
  );
}

export function Select({ id, required, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { id: string }) {
  return (
    <select
      id={id}
      name={id}
      required={required}
      className={base}
      style={style}
      onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420"; e.currentTarget.style.borderColor = "var(--color-brand-800)"; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "var(--color-input-border)"; }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-5 ${className ?? ""}`}>{children}</div>;
}

export function SubmitButton({ label, pending }: { label: string; pending?: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "var(--color-brand-800)" }}
    >
      {pending ? "Submitting…" : label}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg px-4 py-3 mb-5 text-sm" style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger)", border: "1px solid #fecaca" }}>
      {message}
    </div>
  );
}

export function SuccessBanner({ message }: { message: string }) {
  return (
    <div role="status" className="rounded-lg px-4 py-3 mb-5 text-sm" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)", border: "1px solid var(--color-input-border)" }}>
      {message}
    </div>
  );
}
