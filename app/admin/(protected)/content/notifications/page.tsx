import { requireAuth } from "@/lib/auth";
import { getAllAdminNotifications } from "@/lib/cms/notifications";
import { fmtDate } from "@/lib/format";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteNotificationButton } from "./_delete-button";

export const metadata = { title: "Notifications — IC IITP Admin" };
export const dynamic = "force-dynamic";

export default async function NotificationsListPage() {
  await requireAuth();
  const notifications = await getAllAdminNotifications();
  const publishedCount = notifications.filter((n) => n.published).length;

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Notifications</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          {publishedCount} published
        </span>
        <Link
          href="/admin/content/notifications/new"
          className="ml-auto flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: "var(--color-brand-800)" }}
        >
          <Plus className="w-4 h-4" /> New notification
        </Link>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ border: "1.5px dashed #d4e6c4" }}>
          <Bell className="w-10 h-10 mx-auto mb-3" style={{ color: "#b8d4a0" }} />
          <p className="text-sm font-medium mb-4" style={{ color: "var(--color-text-secondary)" }}>No notifications yet.</p>
          <Link href="/admin/content/notifications/new" className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>
            <Plus className="w-4 h-4" /> New notification
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e8f0e0" }}>
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #e8f0e0" }}>
                <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Deadline</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-surface-tint)" }}>
              {notifications.map((n) => (
                <tr key={n.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold leading-snug truncate" style={{ color: "var(--color-brand-950)" }}>{n.title}</p>
                    {n.slug && (
                      <p className="text-xs font-mono mt-0.5 truncate" style={{ color: "var(--color-placeholder)" }}>/notifications/{n.slug}</p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    {n.category ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                        {n.category}
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: "var(--color-placeholder)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {fmtDate(n.deadline) || "—"}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={n.published
                        ? { backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }
                        : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                      {n.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={`/en/notifications/${n.id}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: "var(--color-surface-card)", color: "var(--color-text-secondary)" }}>
                        View
                      </a>
                      <Link href={`/admin/content/notifications/${n.id}`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                        Edit
                      </Link>
                      <DeleteNotificationButton id={n.id} title={n.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
