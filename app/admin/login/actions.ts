"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  TOKEN_COOKIE,
  REFRESH_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
  ok?: boolean;
}

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

export async function loginAction(
  _prevState: LoginState | null,
  formData: FormData
): Promise<LoginState> {
  const email    = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const next     = (formData.get("next") as string | null) ?? "/admin";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  let accessToken: string;
  let refreshToken: string;
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 401 || res.status === 403) {
      return { error: "Invalid email or password." };
    }
    if (res.status === 429) {
      return { error: "Too many login attempts. Please wait 15 minutes and try again." };
    }
    const text = await res.text();
    if (!res.ok) {
      return { error: "Sign-in failed. Please try again." };
    }
    const data = JSON.parse(text) as { accessToken?: string; refreshToken?: string };
    if (!data.accessToken) return { error: "Sign-in failed. Please try again." };
    accessToken  = data.accessToken;
    refreshToken = data.refreshToken ?? "";
  } catch (e) {
    if ((e as Error).name === "TimeoutError") {
      return { error: "Server is not responding. Please try again." };
    }
    return { error: "Could not reach the server. Please try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE,   accessToken,  COOKIE_OPTS(ACCESS_COOKIE_MAX_AGE));
  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE, refreshToken, COOKIE_OPTS(REFRESH_COOKIE_MAX_AGE));
  }

  // Strip characters that are not valid in a URL path before redirecting.
  // Prevents accidental (or injected) garbage like a trailing ' from causing 404s.
  const safeNext = next.replace(/[^a-zA-Z0-9/\-_?=&#%]/g, "");
  redirect(safeNext.startsWith("/admin") ? safeNext : "/admin");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken  = cookieStore.get(TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);

  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken: refreshToken ?? null }),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // best-effort — cookies are already cleared
  }

  redirect("/admin/login");
}
