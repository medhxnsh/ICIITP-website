"use server";

import { cookies } from "next/headers";
import { TOKEN_COOKIE } from "@/lib/auth";

const API_BASE = process.env.API_URL ?? "http://localhost:8080/api/v1";

export interface ChangePasswordState { error?: string; ok?: boolean }

export async function changePasswordAction(
  _prev: ChangePasswordState | null,
  formData: FormData
): Promise<ChangePasswordState> {
  const currentPassword = (formData.get("currentPassword") as string | null) ?? "";
  const newPassword     = (formData.get("newPassword") as string | null) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string | null) ?? "";

  if (!currentPassword || !newPassword) return { error: "All fields are required." };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "Passwords do not match." };
  if (currentPassword === newPassword) return { error: "New password must differ from the current password." };

  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return { error: "Session expired. Please sign in again." };

  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 400 || res.status === 401) {
      const data = await res.json().catch(() => ({}));
      return { error: (data as { message?: string }).message ?? "Current password is incorrect." };
    }
    if (res.status === 403) {
      return { error: "Only super-admins can change their password here." };
    }
    if (!res.ok) {
      return { error: "Failed to change password. Please try again." };
    }

    return { ok: true };
  } catch {
    return { error: "Could not reach the server. Please try again." };
  }
}

export async function getMailStatusAction(): Promise<{ configured: boolean; recoveryEmail: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return { configured: false, recoveryEmail: "" };

  try {
    const res = await fetch(`${API_BASE}/auth/mail-status`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { configured: false, recoveryEmail: "" };
    return res.json();
  } catch {
    return { configured: false, recoveryEmail: "" };
  }
}
