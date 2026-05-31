import "server-only";
import { cookies } from "next/headers";
import {
  TOKEN_COOKIE,
  REFRESH_COOKIE,
  ACCESS_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
} from "@/lib/auth";

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

const COOKIE_OPTS = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});

/** Attempt a silent token refresh. Returns the new access token or null. */
async function tryRefresh(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string; refreshToken?: string };
    if (!data.accessToken) return null;

    // Rotate both tokens
    cookieStore.set(TOKEN_COOKIE,   data.accessToken,           COOKIE_OPTS(ACCESS_COOKIE_MAX_AGE));
    if (data.refreshToken) {
      cookieStore.set(REFRESH_COOKIE, data.refreshToken, COOKIE_OPTS(REFRESH_COOKIE_MAX_AGE));
    }
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean; _isRetry?: boolean; revalidate?: number | false; tags?: string[] }
): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers ?? {}) as Record<string, string>),
  };

  if (token && !init?.skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const { skipAuth: _, _isRetry: __, revalidate, tags, ...fetchInit } = init ?? {};

  // Cache when: GET request AND caller explicitly opted in with revalidate.
  // Auth state is irrelevant — public endpoints return the same data for all
  // users, and the caller signals intent by passing revalidate. Admin-only
  // calls (no revalidate) fall through to no-store as before.
  const isGet = !fetchInit.method || fetchInit.method === "GET";
  const cacheOpts: RequestInit =
    isGet && revalidate !== undefined && revalidate !== false
      ? { next: { revalidate, ...(tags?.length ? { tags } : {}) } }
      : { cache: "no-store" };

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchInit,
    headers,
    ...cacheOpts,
    signal: fetchInit?.signal ?? AbortSignal.timeout(8000),
  });

  // Silently refresh and retry once on 401 (expired access token)
  if (res.status === 401 && !init?._isRetry && !init?.skipAuth) {
    const newToken = await tryRefresh();
    if (newToken) {
      return apiFetch<T>(path, { ...init, _isRetry: true });
    }
    // Refresh failed — throw so requireAuth() redirects to login
    throw new Error(`API 401 ${path}: session expired`);
  }

  if (res.status === 404) return null as T;

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${path}: ${text}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}
