"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { forgotPasswordAction, type ForgotState } from "./actions";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const RESEND_SECONDS = 60;

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown when OTP is successfully sent
  useEffect(() => {
    if (!state?.ok) return;
    setResendCountdown(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setResendCountdown((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [state?.ok, state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    if (email) setSubmittedEmail(email);
  };

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: "var(--color-brand-800)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-brand-950)" }}>
            If that account exists and is authorised for password reset, a 6-digit OTP has been sent to the recovery email configured on the server.
          </p>
        </div>

        <Link
          href="/admin/reset-password"
          className="inline-block w-full text-center py-2.5 text-sm font-semibold rounded-lg text-white"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          Enter OTP
        </Link>

        <div className="text-center">
          {resendCountdown > 0 ? (
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Resend available in {resendCountdown}s
            </p>
          ) : (
            <form
              action={action}
              onSubmit={(e) => {
                clearInterval(timerRef.current!);
                handleSubmit(e);
              }}
              className="inline"
            >
              <input type="hidden" name="email" value={submittedEmail} />
              <button
                type="submit"
                disabled={pending}
                className="text-xs font-semibold underline underline-offset-2 disabled:opacity-50"
                style={{ color: "var(--color-brand-800)" }}
              >
                {pending ? "Sending…" : "Resend OTP"}
              </button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link href="/admin/login" className="text-xs hover:underline" style={{ color: "var(--color-text-body)" }}>
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Admin email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-shadow focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ border: "1.5px solid var(--color-input-border)", backgroundColor: "#fafff6", color: "var(--color-brand-950)" }}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420")}
          onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
          placeholder="you@iitp.ac.in"
        />
      </div>

      {state?.error && (
        <p className="text-sm rounded-lg px-3.5 py-2.5" style={{ backgroundColor: "var(--color-danger-bg)", color: "#991b1b" }} role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--color-brand-800)" }}
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {pending ? "Sending…" : "Send OTP"}
      </button>

      <div className="text-center">
        <Link href="/admin/login" className="text-xs hover:underline" style={{ color: "var(--color-text-body)" }}>
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
