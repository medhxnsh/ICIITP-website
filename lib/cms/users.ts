import "server-only";
import { apiFetch } from "@/lib/api-client";

export type { CmsUser, PermissionKey } from "./users-shared";
export { ALL_PERMISSIONS } from "./users-shared";

export function listUsers(): Promise<import("./users-shared").CmsUser[]> {
  return apiFetch<import("./users-shared").CmsUser[]>("/admin/users");
}

export function createUser(email: string, password: string, permissions: string[]): Promise<import("./users-shared").CmsUser> {
  return apiFetch<import("./users-shared").CmsUser>("/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, password, permissions }),
  });
}

export function updatePermissions(id: string, permissions: string[]): Promise<import("./users-shared").CmsUser> {
  return apiFetch<import("./users-shared").CmsUser>(`/admin/users/${id}/permissions`, {
    method: "PATCH",
    body: JSON.stringify({ permissions }),
  });
}

export function deactivateUser(id: string): Promise<import("./users-shared").CmsUser> {
  return apiFetch<import("./users-shared").CmsUser>(`/admin/users/${id}/deactivate`, { method: "PATCH" });
}

export function activateUser(id: string): Promise<import("./users-shared").CmsUser> {
  return apiFetch<import("./users-shared").CmsUser>(`/admin/users/${id}/activate`, { method: "PATCH" });
}

export function resetUserPassword(id: string, newPassword: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${id}/reset-password`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  });
}

export function deleteUser(id: string): Promise<void> {
  return apiFetch<void>(`/admin/users/${id}`, { method: "DELETE" });
}
