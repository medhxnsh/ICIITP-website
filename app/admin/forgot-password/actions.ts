"use server";

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

export interface ForgotState { error?: string; ok?: boolean }

export async function forgotPasswordAction(
  _prev: ForgotState | null,
  formData: FormData
): Promise<ForgotState> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  if (!email) return { error: "Email is required." };

  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (res.status === 429) {
      return { error: "A code was recently sent. Please wait a moment before requesting again." };
    }

    if (res.status >= 500) {
      return { error: "Server error — please try again in a moment." };
    }

    // Always show success for 2xx/4xx to avoid email enumeration
    return { ok: true };
  } catch {
    return { error: "Could not reach the server. Check your connection and try again." };
  }
}
