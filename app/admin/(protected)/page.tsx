import { requireAuth } from "@/lib/auth";
import { getAllPrograms, getAllEvents, getAllNotifications } from "@/lib/content";
import { getAdminEvents } from "@/lib/cms/events";
import { getAllAdminNotifications } from "@/lib/cms/notifications";
import { getAllAdminDownloads } from "@/lib/cms/downloads";
import { getAllCmsPrograms } from "@/lib/cms/programs";
import { getSubmissions } from "@/lib/submissions";
import { tsToMs, fmtDate, timeAgo } from "@/lib/format";
import {
  BookOpen, Calendar, Bell, Download,
  ArrowRight, ClipboardList, Upload, Link2,
  Map, FileEdit, Plus, AlertCircle, Clock,
} from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard — IC IITP Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const user = await requireAuth();

  const [
    submissions,
    cmsEvents,
    cmsNotifs,
    cmsDownloads,
    cmsPrograms,
  ] = await Promise.all([
    getSubmissions(undefined, 500).catch(() => []),
    getAdminEvents().catch(() => []),
    getAllAdminNotifications().catch(() => []),
    getAllAdminDownloads().catch(() => []),
    getAllCmsPrograms().catch(() => []),
  ]);

  const staticPrograms = getAllPrograms("en");
  const staticEvents = getAllEvents("en");
  const staticNotifs = getAllNotifications("en");

  // Applications breakdown
  const pendingByType = submissions.reduce<Record<string, number>>((acc, s) => {
    if (s.status === "pending") acc[s.type] = (acc[s.type] ?? 0) + 1;
    return acc;
  }, {});
  const totalPending = Object.values(pendingByType).reduce((a, b) => a + b, 0);
  const lastSubmissionMs = submissions.length > 0 ? tsToMs(submissions[0].createdAt) : 0;

  // Status chart data
  const statusCounts = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] ?? 0) + 1;
    return acc;
  }, {});
  const typeCounts = submissions.reduce<Record<string, number>>((acc, s) => {
    acc[s.type] = (acc[s.type] ?? 0) + 1;
    return acc;
  }, {});
  const totalSubmissions = submissions.length;

  const STATUS_META: { key: string; label: string; color: string; bg: string }[] = [
    { key: "pending",   label: "Pending",   color: "#c2410c", bg: "#ffedd5" },
    { key: "reviewing", label: "Reviewing", color: "#1d4ed8", bg: "#dbeafe" },
    { key: "accepted",  label: "Accepted",  color: "#166534", bg: "#dcfce7" },
    { key: "rejected",  label: "Rejected",  color: "#991b1b", bg: "#fee2e2" },
  ];

  // CMS stats
  const lastEventMs = cmsEvents.reduce((mx, e) => Math.max(mx, tsToMs(e.updatedAt)), 0);
  const upcomingEvents = cmsEvents.filter((e) => e.status === "Upcoming" || e.status === "Ongoing").length;

  const now = Date.now();
  const lastNotifMs = cmsNotifs.reduce((mx, n) => Math.max(mx, tsToMs(n.updatedAt)), 0);
  const activeNotifs = cmsNotifs.filter((n) => {
    const dl = tsToMs(n.deadline);
    const vf = tsToMs(n.validFrom);
    return n.published && (!dl || dl > now) && (!vf || vf <= now);
  }).length + staticNotifs.filter((n) => {
    const vf = new Date(n.validFrom).getTime();
    const vt = new Date(n.validTo).getTime();
    // Treat malformed dates as not-active rather than always-active (NaN comparisons are false).
    if (Number.isNaN(vf) || Number.isNaN(vt)) return false;
    return vf <= now && vt >= now;
  }).length;

  const lastDownloadMs = cmsDownloads.reduce((mx, d) => Math.max(mx, tsToMs(d.updatedAt)), 0);
  const lastProgramMs = cmsPrograms.reduce((mx, p) => Math.max(mx, tsToMs(p.updatedAt)), 0);

  // Recent activity feed — collect all CMS edits, sort newest first
  type ActivityItem = { label: string; what: string; ms: number; href: string };
  const activity: ActivityItem[] = [
    ...cmsEvents.map((e) => ({
      label: e.title,
      what: "Event " + (e.published ? "published" : "draft"),
      ms: tsToMs(e.updatedAt),
      href: `/admin/content/events/${e.id}`,
    })),
    ...cmsNotifs.map((n) => ({
      label: n.title,
      what: "Notification " + (n.published ? "published" : "draft"),
      ms: tsToMs(n.updatedAt),
      href: `/admin/content/notifications/${n.id}`,
    })),
    ...cmsDownloads.map((d) => ({
      label: d.title,
      what: "Download updated",
      ms: tsToMs(d.updatedAt),
      href: `/admin/content/downloads/${d.id}`,
    })),
    ...submissions.slice(0, 10).map((s) => ({
      label: ((s as unknown as Record<string, unknown>).founderName ?? (s as unknown as Record<string, unknown>).name ?? (s as unknown as Record<string, unknown>).email ?? "—") as string,
      what: `${s.type} application received`,
      ms: tsToMs(s.createdAt),
      href: `/admin/applications?type=${s.type}`,
    })),
  ]
    .filter((a) => a.ms > 0)
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 8);

  const contentCards = [
    {
      label: "Programs",
      icon: <BookOpen className="w-5 h-5" />,
      href: "/admin/content/programs",
      total: staticPrograms.length,
      sub1: `${cmsPrograms.length} CMS overrides`,
      sub2: lastProgramMs ? `Last edit ${timeAgo(lastProgramMs)}` : "No CMS edits yet",
    },
    {
      label: "Events",
      icon: <Calendar className="w-5 h-5" />,
      href: "/admin/content/events",
      total: staticEvents.length + cmsEvents.length,
      sub1: `${upcomingEvents} upcoming`,
      sub2: lastEventMs ? `Last edit ${timeAgo(lastEventMs)}` : "No edits yet",
    },
    {
      label: "Notifications",
      icon: <Bell className="w-5 h-5" />,
      href: "/admin/content/notifications",
      total: staticNotifs.length + cmsNotifs.length,
      sub1: `${activeNotifs} active`,
      sub2: lastNotifMs ? `Last edit ${timeAgo(lastNotifMs)}` : "No edits yet",
    },
    {
      label: "Downloads",
      icon: <Download className="w-5 h-5" />,
      href: "/admin/content/downloads",
      total: cmsDownloads.length,
      sub1: `${cmsDownloads.filter((d) => d.published).length} published`,
      sub2: lastDownloadMs ? `Last edit ${timeAgo(lastDownloadMs)}` : "No uploads yet",
    },
  ];

  return (
    <main className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ color: "#1c2e06" }}>
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="text-sm" style={{ color: "#5a6644" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Applications alert */}
      <section className="mb-8">
        <Link
          href="/admin/applications"
          className="group flex items-start gap-5 rounded-xl p-5 transition-shadow hover:shadow-sm"
          style={{
            backgroundColor: totalPending > 0 ? "#fff7ed" : "#f0f7e6",
            border: `1px solid ${totalPending > 0 ? "#fed7aa" : "#d4e6c4"}`,
          }}
        >
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: totalPending > 0 ? "#f79420" : "#3a5214", color: "white" }}
          >
            <ClipboardList className="w-5 h-5" />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <p className="text-sm font-bold" style={{ color: "#1c2e06" }}>Applications</p>
              {totalPending > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "#f79420", color: "white" }}>
                  <AlertCircle className="w-3 h-3" /> {totalPending} pending
                </span>
              )}
            </div>
            <p className="text-xs mb-2" style={{ color: "#7a8e6a" }}>
              {submissions.length} total · Last received: {fmtDate(lastSubmissionMs)}
            </p>
            {totalPending > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(pendingByType).map(([type, count]) => (
                  <span key={type} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "#ffedd5", color: "#c2410c" }}>
                    {count} {type}
                  </span>
                ))}
              </div>
            )}
            {totalPending === 0 && (
              <p className="text-xs font-medium" style={{ color: "#3a5214" }}>All caught up — no pending applications</p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#f79420" }} />
        </Link>
      </section>

      {/* Content stats */}
      <section className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#5a7c20" }}>Content overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contentCards.map(({ label, icon, href, total, sub1, sub2 }) => (
            <Link
              key={label}
              href={href}
              className="group bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow flex flex-col gap-3"
              style={{ borderColor: "#e8f0e0" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-black leading-none mb-1" style={{ color: "#3a5214" }}>{total}</p>
                  <p className="text-sm font-semibold" style={{ color: "#1c2e06" }}>{label}</p>
                </div>
                <span style={{ color: "#3a5214" }} aria-hidden="true">{icon}</span>
              </div>
              <div className="space-y-1 pt-1 border-t" style={{ borderColor: "#f0f7e6" }}>
                <p className="text-[11px] font-semibold" style={{ color: "#5a6644" }}>{sub1}</p>
                <p className="text-[11px] flex items-center gap-1" style={{ color: "#aab89e" }}>
                  <Clock className="w-3 h-3 shrink-0" /> {sub2}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Applications status chart */}
      <section className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#5a7c20" }}>Applications overview</h2>
        <div className="bg-white rounded-xl border p-6" style={{ borderColor: "#e8f0e0" }}>
          <div className="grid sm:grid-cols-2 gap-8">

            {/* Status breakdown */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#5a6644" }}>By status · {totalSubmissions} total</p>
              <div className="space-y-3">
                {STATUS_META.map(({ key, label, color, bg }) => {
                  const count = statusCounts[key] ?? 0;
                  const pct = totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color }}>{label}</span>
                        <span className="text-xs font-bold" style={{ color }}>{count}</span>
                      </div>
                      <div className="w-full rounded-full h-2.5" style={{ backgroundColor: "#f0f7e6" }}>
                        <div
                          className="h-2.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: color, minWidth: count > 0 ? "6px" : "0" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Type breakdown */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "#5a6644" }}>By type</p>
              <div className="space-y-3">
                {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                  const pct = totalSubmissions > 0 ? Math.round((count / totalSubmissions) * 100) : 0;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1">
                        <Link href={`/admin/applications?type=${type}`} className="text-xs font-semibold hover:underline" style={{ color: "#3a5214" }}>
                          {type}
                        </Link>
                        <span className="text-xs font-bold" style={{ color: "#1c2e06" }}>{count}</span>
                      </div>
                      <div className="w-full rounded-full h-2.5" style={{ backgroundColor: "#f0f7e6" }}>
                        <div
                          className="h-2.5 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: "#3a5214", minWidth: count > 0 ? "6px" : "0" }}
                        />
                      </div>
                    </div>
                  );
                })}
                {Object.keys(typeCounts).length === 0 && (
                  <p className="text-xs py-4 text-center" style={{ color: "#aab89e" }}>No submissions yet</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Recent activity + quick actions side by side */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Recent activity */}
        <section className="lg:col-span-2">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#5a7c20" }}>Recent activity</h2>
          <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: "#e8f0e0" }}>
            {activity.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "#7a8e6a" }}>No activity yet.</p>
            ) : (
              <ul>
                {activity.map((item, i) => (
                  <li key={i} style={{ borderBottom: i < activity.length - 1 ? "1px solid #f0f7e6" : "none" }}>
                    <Link href={item.href} className="flex items-start gap-3 px-4 py-3 hover:bg-[#fafdf7] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "#1c2e06" }}>{item.label}</p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#7a8e6a" }}>{item.what}</p>
                      </div>
                      <span className="text-[11px] shrink-0 mt-0.5" style={{ color: "#aab89e" }}>{timeAgo(item.ms)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#5a7c20" }}>Quick actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add notification", href: "/admin/content/notifications/new", icon: <Plus className="w-4 h-4" /> },
              { label: "Add event", href: "/admin/content/events/new", icon: <Calendar className="w-4 h-4" /> },
              { label: "Add download", href: "/admin/content/downloads/new", icon: <Upload className="w-4 h-4" /> },
              { label: "Edit pages", href: "/admin/pages", icon: <FileEdit className="w-4 h-4" /> },
              { label: "Form links", href: "/admin/forms", icon: <Link2 className="w-4 h-4" /> },
              { label: "Site map", href: "/admin/site-map", icon: <Map className="w-4 h-4" /> },
            ].map(({ label, href, icon }) => (
              <Link
                key={label}
                href={href}
                className="group flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border hover:shadow-sm transition-shadow"
                style={{ borderColor: "#e8f0e0" }}
              >
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}>
                  {icon}
                </span>
                <span className="text-sm font-medium flex-1" style={{ color: "#1c2e06" }}>{label}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#f79420" }} />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
