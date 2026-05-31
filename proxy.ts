import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

// Uses Web Crypto API (available in Edge Runtime — no Node.js crypto needed)
function base64urlToBytes(b64: string): Uint8Array<ArrayBuffer> {
  const padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  const bin    = atob(padded);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function verifyJwt(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [header, payload, sig] = parts;
  try {
    const hdr = JSON.parse(
      new TextDecoder().decode(base64urlToBytes(header))
    ) as { alg?: string };
    const hashAlg =
      hdr.alg === "HS256" ? "SHA-256" :
      hdr.alg === "HS384" ? "SHA-384" :
      hdr.alg === "HS512" ? "SHA-512" : null;
    if (!hashAlg) return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: hashAlg },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC", key,
      base64urlToBytes(sig),
      new TextEncoder().encode(`${header}.${payload}`)
    );
    if (!valid) return false;

    const data = JSON.parse(
      new TextDecoder().decode(base64urlToBytes(payload))
    ) as { exp?: number; type?: string };
    if (data.type !== "access") return false;
    if (data.exp && Math.floor(Date.now() / 1000) > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Guard all /admin/* except public auth pages
  const publicAdminPaths = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  if (pathname.startsWith("/admin") && !publicAdminPaths.some((p) => pathname.startsWith(p))) {
    const token  = req.cookies.get("iciitp_token")?.value;
    const secret = process.env.JWT_SECRET ?? "";
    const valid  = token ? await verifyJwt(token, secret) : false;

    if (!valid) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Skip intl middleware for admin and API routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)" ],
};
