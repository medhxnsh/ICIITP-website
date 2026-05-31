import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("iciitp_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const text = await res.text().catch(() => "");
  const json = text ? JSON.parse(text) : {};
  return NextResponse.json(json, { status: res.status });
}
