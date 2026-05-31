"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserAction } from "../actions";
import { ALL_PERMISSIONS } from "@/lib/cms/users-shared";
import { Loader2 } from "lucide-react";

export function CreateUserForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createUserAction, null);

  useEffect(() => {
    if (state && !state.error) router.push("/admin/users");
  }, [state, router]);

  return (
    <form action={action} className="space-y-6 bg-white rounded-2xl border p-6" style={{ borderColor: "#dde6d0" }}>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Email address
        </label>
        <input
          name="email"
          type="email"
          required
          autoComplete="off"
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ border: "1.5px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
          placeholder="name@iitp.ac.in"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-brand-950)" }}>
          Initial password
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[--color-brand-500]"
          style={{ border: "1.5px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
          placeholder="Min. 8 characters"
        />
        <p className="text-xs mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
          The user should change this after their first sign-in.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium mb-3" style={{ color: "var(--color-brand-950)" }}>
          Page access
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PERMISSIONS.map((p) => (
            <label
              key={p.key}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm select-none"
              style={{ border: "1.5px solid #e8f0de", backgroundColor: "#fafff6" }}
            >
              <input
                type="checkbox"
                name="permissions"
                value={p.key}
                className="accent-[#3a5214] w-4 h-4 shrink-0"
              />
              <span style={{ color: "var(--color-brand-800)" }}>{p.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs mt-2" style={{ color: "var(--color-text-secondary)" }}>
          Only checked sections will appear in this user&apos;s sidebar.
        </p>
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
          {pending ? "Creating…" : "Create user"}
        </button>
        <a
          href="/admin/users"
          className="px-5 py-2.5 text-sm font-medium rounded-lg border"
          style={{ borderColor: "var(--color-input-border)", color: "var(--color-text-body)" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
