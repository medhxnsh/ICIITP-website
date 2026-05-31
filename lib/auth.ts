import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "VIEWER";
  superAdmin: boolean;
  permissions: string[];
}

export const TOKEN_COOKIE   = "iciitp_token";
export const REFRESH_COOKIE = "iciitp_refresh";

// Access token: 15 min. Must match app.jwt.access-expiry-ms in Spring Boot.
export const ACCESS_COOKIE_MAX_AGE  = 60 * 15;
// Refresh token: 7 days. Must match app.jwt.refresh-expiry-ms in Spring Boot.
export const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const ALG_MAP: Record<string, string> = {
  HS256: "sha256",
  HS384: "sha384",
  HS512: "sha512",
};

interface JwtPayload {
  sub: string;
  role: string;
  superAdmin?: boolean;
  permissions?: string[];
  type: string;
  exp: number;
}

export function verifyToken(token: string): JwtPayload | null {
  const secret = process.env.JWT_SECRET ?? "";
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  try {
    const hdr = JSON.parse(Buffer.from(header, "base64url").toString()) as { alg?: string };
    const nodeAlg = ALG_MAP[hdr.alg ?? ""];
    if (!nodeAlg) return null;
    const expected = createHmac(nodeAlg, secret)
      .update(`${header}.${payload}`)
      .digest("base64url");
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as JwtPayload;
    if (data.exp && Math.floor(Date.now() / 1000) > data.exp) return null;
    if (data.type !== "access") return null;
    return data;
  } catch {
    return null;
  }
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._]/g, " ");
}

export async function requireAuth(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) redirect("/admin/login");
  const data = verifyToken(token);
  if (!data) redirect("/admin/login");
  return {
    userId:      data.sub,
    email:       data.sub,
    name:        nameFromEmail(data.sub),
    role:        data.role as AdminSession["role"],
    superAdmin:  data.superAdmin ?? false,
    permissions: data.permissions ?? [],
  };
}

/**
 * Require both authentication AND a specific permission (or superAdmin).
 * Redirects to /admin if authenticated but lacking the permission.
 * Usage: await requirePermission("applications")
 */
export async function requirePermission(permission: string): Promise<AdminSession> {
  const session = await requireAuth();
  if (!session.superAdmin && !session.permissions.includes(permission)) {
    redirect("/admin");
  }
  return session;
}

export async function getSession(): Promise<{ userId: string | null }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return { userId: null };
  const data = verifyToken(token);
  return { userId: data?.sub ?? null };
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}
