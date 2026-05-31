"use client";

import { useActionState, useState } from "react";
import { loginAction } from "./actions";
import { Loader2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface Props { next?: string }

export function LoginForm({ next }: Props) {
  const [state, action, pending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} noValidate className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--color-brand-950)" }}
        >
          Email address
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

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-1.5"
          style={{ color: "var(--color-brand-950)" }}
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border outline-none transition-shadow focus:ring-2 focus:ring-[--color-brand-500]"
            style={{ border: "1.5px solid var(--color-input-border)", backgroundColor: "#fafff6", color: "var(--color-brand-950)" }}
            onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px #3a521420")}
            onBlur={(e)  => (e.currentTarget.style.boxShadow = "none")}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword
              ? <EyeOff className="w-4 h-4" aria-hidden="true" />
              : <Eye   className="w-4 h-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {state?.error && (
        <p
          className="text-sm rounded-lg px-3.5 py-2.5"
          style={{ backgroundColor: "var(--color-danger-bg)", color: "#991b1b" }}
          role="alert"
        >
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
        {pending ? "Signing in…" : "Sign in"}
      </button>

      <div className="text-center">
        <Link
          href="/admin/forgot-password"
          className="text-xs hover:underline"
          style={{ color: "var(--color-text-body)" }}
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
