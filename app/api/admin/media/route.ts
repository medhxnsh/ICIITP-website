import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("iciitp_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${API_BASE}/media?size=500`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json([], { status: res.status });

  const page = await res.json();
  return NextResponse.json(page?.content ?? page);
}
