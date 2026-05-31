import { requireAuth } from "@/lib/auth";
import { getAdminEvents, resolveStatus } from "@/lib/cms/events";
import { fmtDate } from "@/lib/format";
import { Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteEventButton } from "./_delete-button";

export const metadata = { title: "Events — IC IITP Admin" };
export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  Upcoming:  { bg: "#eff6ff", text: "#1d4ed8" },
  Ongoing:   { bg: "var(--color-surface-tint)", text: "var(--color-brand-800)" },
  Active:    { bg: "var(--color-surface-tint)", text: "var(--color-brand-800)" },
  Closed:    { bg: "#f1f5f9", text: "#475569" },
  Concluded: { bg: "#f1f5f9", text: "#475569" },
  Recurring: { bg: "#fef9c3", text: "#854d0e" },
};

export default async function EventsListPage() {
  await requireAuth();
  const events = await getAdminEvents();

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Events</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          {events.length} total
        </span>
        <Link href="/admin/content/events/new" className="ml-auto flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>
          <Plus className="w-4 h-4" /> New event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed #d4e6c4" }}>
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>No events yet.</p>
          <p className="text-xs mt-1" style={{ color: "var(--color-placeholder)" }}>Use &ldquo;+ New event&rdquo; to create one.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e8f0e0" }}>
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "34%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "16%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #e8f0e0" }}>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Event</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Category</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Status</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Visibility</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Updated</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-surface-tint)" }}>
              {events.map((ev) => {
                const resolved = resolveStatus(ev);
                const style = STATUS_STYLES[resolved] ?? STATUS_STYLES.Closed;
                return (
                  <tr key={ev.id}>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold leading-snug truncate" style={{ color: "var(--color-brand-950)" }}>{ev.title}</p>
                      <p className="text-xs mt-0.5 font-mono truncate" style={{ color: "var(--color-placeholder)" }}>{ev.slug}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs truncate" style={{ color: "var(--color-text-body)" }}>{ev.category}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ backgroundColor: style.bg, color: style.text }}>
                        {resolved}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={ev.published
                          ? { backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }
                          : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                        {ev.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>{fmtDate(ev.updatedAt ?? ev.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/en/events/${ev.slug}`} target="_blank"
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "var(--color-surface-card)", color: "var(--color-text-secondary)" }}>
                          View ↗
                        </Link>
                        <Link href={`/admin/content/events/${ev.id}`}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                          Edit
                        </Link>
                        <DeleteEventButton id={ev.id} title={ev.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
