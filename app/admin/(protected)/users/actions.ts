"use server";

import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createUser, deactivateUser, activateUser, resetUserPassword, updatePermissions, deleteUser } from "@/lib/cms/users";

export async function createUserAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await requireAuth();
  if (!session.superAdmin) return { error: "Only super-admins can create users." };

  const email    = (formData.get("email") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const perms    = formData.getAll("permissions") as string[];

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8)  return { error: "Password must be at least 8 characters." };

  try {
    await createUser(email, password, perms);
    revalidatePath("/admin/users");
    return {};
  } catch (e) {
    const msg = (e as Error).message ?? "";
    if (msg.includes("already exists")) return { error: "A user with this email already exists." };
    return { error: "Failed to create user. Please try again." };
  }
}

export async function toggleActiveAction(id: string, active: boolean): Promise<void> {
  const session = await requireAuth();
  if (!session.superAdmin) return;
  if (active) {
    await activateUser(id);
  } else {
    await deactivateUser(id);
  }
  revalidatePath("/admin/users");
}

export async function updatePermissionsAction(id: string, permissions: string[]): Promise<{ error?: string }> {
  const session = await requireAuth();
  if (!session.superAdmin) return { error: "Only super-admins can update permissions." };
  try {
    await updatePermissions(id, permissions);
    revalidatePath("/admin/users");
    return {};
  } catch {
    return { error: "Failed to update permissions." };
  }
}

export async function deleteUserAction(id: string): Promise<{ error?: string }> {
  const session = await requireAuth();
  if (!session.superAdmin) return { error: "Only super-admins can delete users." };
  try {
    await deleteUser(id);
    revalidatePath("/admin/users");
    return {};
  } catch {
    return { error: "Failed to delete user. Please try again." };
  }
}

export async function resetPasswordAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireAuth();
  if (!session.superAdmin) return { error: "Only super-admins can reset passwords." };

  const id          = (formData.get("id") as string) ?? "";
  const newPassword = (formData.get("newPassword") as string) ?? "";

  if (!id || !newPassword) return { error: "All fields are required." };
  if (newPassword.length < 8) return { error: "Password must be at least 8 characters." };

  try {
    await resetUserPassword(id, newPassword);
    revalidatePath("/admin/users");
    return { ok: true };
  } catch {
    return { error: "Failed to reset password. Please try again." };
  }
}
