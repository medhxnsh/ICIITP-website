import { NextRequest } from "next/server";

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

export async function GET(req: NextRequest) {
  const scheme = req.nextUrl.searchParams.get("scheme");
  const url = scheme
    ? `${API_BASE}/startups?scheme=${encodeURIComponent(scheme)}`
    : `${API_BASE}/startups`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return Response.json([], { status: res.status });
    return Response.json(await res.json());
  } catch {
    return Response.json([], { status: 502 });
  }
}
