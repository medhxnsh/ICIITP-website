"use client";

import { useActionState, useState } from "react";
import { changePasswordAction } from "./actions";
import { Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, null);
  const [showPw, setShowPw] = useState(false);

  const inputStyle = {
    border: "1.5px solid var(--color-input-border)",
    backgroundColor: "#fafff6",
    color: "var(--color-brand-950)",
  };

  if (state?.ok) {
    return (
      <div className="flex items-start gap-3 rounded-xl px-4 py-3" style={{ backgroundColor: "#f0f9e8" }}>
        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--color-brand-800)" }} />
        <p className="text-sm font-medium" style={{ color: "var(--color-brand-950)" }}>
          Password changed successfully. Your next login will use the new password.
        </p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="space-y-5 max-w-sm">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Current password
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
          required
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-shadow focus:ring-2 focus:ring-[--color-brand-500]"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420")}
          onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
          placeholder="Current password"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          New password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            name="newPassword"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border outline-none transition-shadow focus:ring-2 focus:ring-[--color-brand-500]"
            style={inputStyle}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420")}
            onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
            placeholder="Min. 8 characters"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label={showPw ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPw ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showPw ? "text" : "password"}
          autoComplete="new-password"
          required
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none transition-shadow focus:ring-2 focus:ring-[--color-brand-500]"
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420")}
          onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
          placeholder="Repeat new password"
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
        className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--color-brand-800)" }}
      >
        {pending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
