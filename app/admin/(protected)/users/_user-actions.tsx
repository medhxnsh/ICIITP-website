"use client";

import { useState, useActionState, useTransition } from "react";
import { toggleActiveAction, resetPasswordAction, updatePermissionsAction, deleteUserAction } from "./actions";
import { ALL_PERMISSIONS, type CmsUser } from "@/lib/cms/users-shared";
import { KeyRound, Loader2, Shield, Trash2 } from "lucide-react";

interface Props {
  user: CmsUser;
  currentUserId: string;
}

export function UserActions({ user, currentUserId }: Props) {
  const [showReset, setShowReset] = useState(false);
  const [showPerms, setShowPerms] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState<string[]>(user.permissions ?? []);
  const [permsMsg, setPermsMsg] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [resetState, resetAction, resetting] = useActionState(resetPasswordAction, null);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();

  const isSelf = user.id === currentUserId || user.email === currentUserId;

  async function handleToggle() {
    await toggleActiveAction(user.id, !user.active);
  }

  function togglePerm(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteUserAction(user.id);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        setShowDelete(false);
      }
    });
  }

  function savePerms() {
    startSave(async () => {
      const result = await updatePermissionsAction(user.id, selected);
      setPermsMsg(result.error ?? "Permissions updated.");
      if (!result.error) setTimeout(() => setShowPerms(false), 800);
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap justify-end">
      {/* Edit permissions — only for non-superAdmin users */}
      {!user.superAdmin && (
        <button
          type="button"
          onClick={() => { setShowPerms(true); setPermsMsg(null); setSelected(user.permissions ?? []); }}
          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border"
          style={{ borderColor: "var(--color-input-border)", color: "var(--color-brand-800)", backgroundColor: "white" }}
        >
          <Shield className="w-3 h-3" aria-hidden="true" />
          Permissions
        </button>
      )}

      {/* Activate / deactivate */}
      {!user.superAdmin && !isSelf && (
        <form action={handleToggle}>
          <button
            type="submit"
            className="text-xs font-medium px-3 py-1.5 rounded-md border transition-colors"
            style={user.active
              ? { borderColor: "#fca5a5", color: "#991b1b", backgroundColor: "white" }
              : { borderColor: "#86efac", color: "#166534", backgroundColor: "white" }}
          >
            {user.active ? "Deactivate" : "Activate"}
          </button>
        </form>
      )}

      {/* Reset password */}
      <button
        type="button"
        onClick={() => setShowReset((v) => !v)}
        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border"
        style={{ borderColor: "var(--color-input-border)", color: "var(--color-brand-800)", backgroundColor: "white" }}
      >
        <KeyRound className="w-3 h-3" aria-hidden="true" />
        Reset password
      </button>

      {/* Delete user — only for non-superAdmin, non-self */}
      {!user.superAdmin && !isSelf && (
        <button
          type="button"
          onClick={() => { setShowDelete(true); setDeleteError(null); }}
          className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-md border"
          style={{ borderColor: "#fca5a5", color: "#991b1b", backgroundColor: "white" }}
        >
          <Trash2 className="w-3 h-3" aria-hidden="true" />
          Delete
        </button>
      )}

      {/* ── Permissions modal ───────────────────────────────────────── */}
      {showPerms && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPerms(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-base mb-1" style={{ color: "var(--color-brand-950)" }}>Edit permissions</h3>
            <p className="text-xs mb-5" style={{ color: "var(--color-text-secondary)" }}>{user.email}</p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {ALL_PERMISSIONS.map((p) => (
                <label
                  key={p.key}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm select-none"
                  style={{ border: "1.5px solid #e8f0de", backgroundColor: selected.includes(p.key) ? "#f0faf0" : "white" }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(p.key)}
                    onChange={() => togglePerm(p.key)}
                    className="accent-[#3a5214] w-4 h-4 shrink-0"
                  />
                  <span className="text-xs font-medium" style={{ color: "var(--color-brand-800)" }}>{p.label}</span>
                </label>
              ))}
            </div>

            {permsMsg && (
              <p className="text-xs rounded-lg px-3 py-2 mb-3"
                style={permsMsg.includes("error") || permsMsg.includes("Failed")
                  ? { backgroundColor: "var(--color-danger-bg)", color: "#991b1b" }
                  : { backgroundColor: "#f0fdf4", color: "#166534" }}>
                {permsMsg}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={savePerms}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
                style={{ backgroundColor: "var(--color-brand-800)" }}
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setShowPerms(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border"
                style={{ borderColor: "var(--color-input-border)", color: "var(--color-text-body)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ───────────────────────────────── */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDelete(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-base mb-1" style={{ color: "var(--color-brand-950)" }}>Delete user?</h3>
            <p className="text-xs mb-5" style={{ color: "var(--color-text-secondary)" }}>
              <strong>{user.email}</strong> will be permanently removed. This cannot be undone.
            </p>

            {deleteError && (
              <p className="text-xs rounded-lg px-3 py-2 mb-3" style={{ backgroundColor: "var(--color-danger-bg)", color: "#991b1b" }}>
                {deleteError}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
                style={{ backgroundColor: "#991b1b" }}
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                {deleting ? "Deleting…" : "Delete user"}
              </button>
              <button
                type="button"
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border"
                style={{ borderColor: "var(--color-input-border)", color: "var(--color-text-body)" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset password modal ────────────────────────────────────── */}
      {showReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReset(false); }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-bold text-base mb-1" style={{ color: "var(--color-brand-950)" }}>Reset password</h3>
            <p className="text-xs mb-5" style={{ color: "var(--color-text-secondary)" }}>{user.email}</p>

            <form action={resetAction} className="space-y-4">
              <input type="hidden" name="id" value={user.id} />
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--color-brand-800)" }}>
                  New password
                </label>
                <input
                  name="newPassword"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="w-full px-3 py-2 text-sm rounded-lg border outline-none focus:ring-2 focus:ring-[--color-brand-500]"
                  style={{ border: "1.5px solid var(--color-input-border)", color: "var(--color-brand-950)" }}
                  placeholder="Min. 8 characters"
                />
              </div>

              {resetState?.error && (
                <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "var(--color-danger-bg)", color: "#991b1b" }}>
                  {resetState.error}
                </p>
              )}
              {resetState?.ok && (
                <p className="text-xs rounded-lg px-3 py-2" style={{ backgroundColor: "#f0fdf4", color: "#166534" }}>
                  Password updated successfully.
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={resetting}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg text-white disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-brand-800)" }}
                >
                  {resetting && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
                  {resetting ? "Saving…" : "Update password"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border"
                  style={{ borderColor: "var(--color-input-border)", color: "var(--color-text-body)" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
