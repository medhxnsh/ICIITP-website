"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink as ExternalLinkIcon, X } from "lucide-react";

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ExternalLink({ href, children, className, style }: ExternalLinkProps) {
  const t = useTranslations("a11y");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const confirmRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      confirmRef.current?.focus();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        style={style}
        aria-haspopup="dialog"
      >
        {children}
        <ExternalLinkIcon
          aria-hidden="true"
          className="inline-block ml-1 w-3.5 h-3.5 align-middle"
        />
      </button>

      <dialog
        ref={dialogRef}
        onKeyDown={handleKeyDown}
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-auto w-full max-w-md rounded-[--radius-lg] bg-[--color-surface] p-6 shadow-[--shadow-dropdown] backdrop:bg-black/40"
        aria-labelledby="ext-dialog-title"
        aria-describedby="ext-dialog-body"
      >
        <div className="flex items-start justify-between gap-4 mb-3">
          <h2
            id="ext-dialog-title"
            className="text-base font-semibold text-[--color-text]"
          >
            {t("externalLinkWarning")}
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("externalLinkCancel")}
            className="text-[--color-muted] hover:text-[--color-text] rounded-[--radius-sm]"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p id="ext-dialog-body" className="text-sm text-[--color-text-subtle] mb-5">
          {t("externalLinkBody")}
        </p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm rounded-[--radius-md] border border-[--color-border] text-[--color-text] hover:bg-[--color-surface-alt] transition-colors"
          >
            {t("externalLinkCancel")}
          </button>
          <a
            ref={confirmRef}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="px-4 py-2 text-sm rounded-[--radius-md] font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            {t("externalLinkConfirm")}
          </a>
        </div>
      </dialog>
    </>
  );
}
