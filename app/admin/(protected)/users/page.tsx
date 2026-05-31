import { requireAuth } from "@/lib/auth";
import { listUsers } from "@/lib/cms/users";
import { ALL_PERMISSIONS } from "@/lib/cms/users-shared";
import { fmtDate } from "@/lib/format";
import Link from "next/link";
import { UserActions } from "./_user-actions";
import { Users, ShieldCheck, UserPlus } from "lucide-react";

export const metadata = { title: "Users — IC IITP Admin" };
export const dynamic  = "force-dynamic";

export default async function UsersPage() {
  const session = await requireAuth();
  const users   = await listUsers();

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
          <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>Users</h1>
        </div>
        {session.superAdmin && (
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            Add user
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="rounded-xl p-5 bg-white"
            style={{ border: "1px solid #dde6d0" }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm" style={{ color: "var(--color-brand-950)" }}>{user.email}</span>
                  {user.superAdmin && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#f7942020", color: "#c45a00" }}>
                      <ShieldCheck className="w-2.5 h-2.5" aria-hidden="true" />
                      Super-admin
                    </span>
                  )}
                  <span
                    className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={user.active
                      ? { backgroundColor: "#dcfce7", color: "#166534" }
                      : { backgroundColor: "#fee2e2", color: "#991b1b" }}
                  >
                    {user.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                  Created {user.createdAt ? fmtDate(user.createdAt) : "—"}
                  {user.createdBy ? ` by ${user.createdBy}` : ""}
                </p>

                {/* Permissions chips */}
                {!user.superAdmin && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {(user.permissions ?? []).length === 0 ? (
                      <span className="text-xs italic" style={{ color: "var(--color-placeholder)" }}>No page access granted</span>
                    ) : (
                      (user.permissions ?? []).map((perm) => {
                        const label = ALL_PERMISSIONS.find((p) => p.key === perm)?.label ?? perm;
                        return (
                          <span
                            key={perm}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "#e8f4dc", color: "var(--color-brand-800)" }}
                          >
                            {label}
                          </span>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {session.superAdmin && (
                <UserActions user={user} currentUserId={session.userId} />
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
