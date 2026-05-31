"use server";

import { redirect } from "next/navigation";

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

export interface ResetState { error?: string; ok?: boolean }

export async function resetPasswordAction(
  _prev: ResetState | null,
  formData: FormData
): Promise<ResetState> {
  const email       = (formData.get("email") as string | null)?.trim() ?? "";
  const otp         = (formData.get("otp") as string | null)?.trim() ?? "";
  const newPassword = (formData.get("newPassword") as string | null) ?? "";
  const confirm     = (formData.get("confirmPassword") as string | null) ?? "";

  if (!email || !otp || !newPassword) return { error: "All fields are required." };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };
  if (newPassword !== confirm) return { error: "Passwords do not match." };
  if (otp.length !== 6 || !/^\d{6}$/.test(otp)) return { error: "OTP must be a 6-digit number." };

  try {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: (data as { message?: string }).message ?? "Invalid or expired OTP." };
    }

    redirect("/admin/login?reset=1");
  } catch (e) {
    if ((e as Error).name === "NEXT_REDIRECT") throw e;
    return { error: "Could not reach the server. Please try again." };
  }
}
