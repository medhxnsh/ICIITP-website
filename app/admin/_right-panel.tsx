import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ClipboardList, Globe, Layers, CalendarDays, Briefcase, FileDown, Bell, Plus } from "lucide-react";
import { ClockWidget } from "./_clock-widget";
import { getSubmissions } from "@/lib/submissions";
import { getAllCmsPrograms } from "@/lib/cms/programs";
import { getAdminEvents } from "@/lib/cms/events";
import { getAllCmsStartups } from "@/lib/cms/startups";
import { getAllAdminDownloads } from "@/lib/cms/downloads";
import { getAllAdminNotifications } from "@/lib/cms/notifications";

const STAT_COLORS = {
  applications:  { icon: "#d97706", bg: "#fff7ed" },
  programmes:    { icon: "#7c3aed", bg: "#f5f3ff" },
  portfolio:     { icon: "#0369a1", bg: "#eff6ff" },
  events:        { icon: "#059669", bg: "#f0fdf4" },
  notifications: { icon: "#dc2626", bg: "#fef2f2" },
  downloads:     { icon: "#0891b2", bg: "#ecfeff" },
};

interface SiteStatsProps {
  superAdmin: boolean;
  permissions: string[];
}

function can(superAdmin: boolean, permissions: string[], key: string) {
  return superAdmin || permissions.includes(key);
}

async function SiteStats({ superAdmin, permissions }: SiteStatsProps) {
  const hasApplications  = can(superAdmin, permissions, "applications");
  const hasPrograms      = can(superAdmin, permissions, "programs");
  const hasStartups      = can(superAdmin, permissions, "startups");
  const hasEvents        = can(superAdmin, permissions, "events");
  const hasNotifications = can(superAdmin, permissions, "notifications");
  const hasDownloads     = can(superAdmin, permissions, "downloads");

  const [submissions, programs, events, startups, downloads, notifications] = await Promise.allSettled([
    hasApplications  ? getSubmissions(undefined, 200) : Promise.resolve([]),
    hasPrograms      ? getAllCmsPrograms()             : Promise.resolve([]),
    hasEvents        ? getAdminEvents()                : Promise.resolve([]),
    hasStartups      ? getAllCmsStartups()             : Promise.resolve([]),
    hasDownloads     ? getAllAdminDownloads()           : Promise.resolve([]),
    hasNotifications ? getAllAdminNotifications()       : Promise.resolve([]),
  ]);

  const subs   = submissions.status   === "fulfilled" ? submissions.value   : [];
  const progs  = programs.status      === "fulfilled" ? programs.value      : [];
  const evts   = events.status        === "fulfilled" ? events.value        : [];
  const starts = startups.status      === "fulfilled" ? startups.value      : [];
  const dls    = downloads.status     === "fulfilled" ? downloads.value     : [];
  const notifs = notifications.status === "fulfilled" ? notifications.value : [];

  const pending  = subs.filter((s) => s.status === "pending").length;
  const thisWeek = subs.filter((s) => {
    const d = new Date(s.createdAt as string);
    return Date.now() - d.getTime() < 7 * 86400_000;
  }).length;

  const progsPub  = progs.filter((p) => p.published).length;
  const startsPub = starts.filter((s) => s.published).length;
  const evtsPub   = evts.filter((e) => e.published).length;
  const notifsPub = notifs.filter((n) => n.published).length;
  const dlsPub    = dls.filter((d) => d.published).length;

  const allStats = [
    {
      key: "applications" as const,
      perm: "applications",
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      label: "Applications",
      href: "/admin/applications",
      value: subs.length,
      sub: pending > 0 ? `${pending} pending` : "all reviewed",
      alert: pending > 0,
    },
    {
      key: "programmes" as const,
      perm: "programs",
      icon: <Layers className="w-3.5 h-3.5" />,
      label: "Programmes",
      href: "/admin/content/programs",
      value: progsPub,
      sub: `${progs.length} total`,
    },
    {
      key: "portfolio" as const,
      perm: "startups",
      icon: <Briefcase className="w-3.5 h-3.5" />,
      label: "Portfolio",
      href: "/admin/content/startups",
      value: startsPub,
      sub: `${starts.length} total`,
    },
    {
      key: "events" as const,
      perm: "events",
      icon: <CalendarDays className="w-3.5 h-3.5" />,
      label: "Events",
      href: "/admin/content/events",
      value: evtsPub,
      sub: `${evts.length} total`,
    },
    {
      key: "notifications" as const,
      perm: "notifications",
      icon: <Bell className="w-3.5 h-3.5" />,
      label: "Notifications",
      href: "/admin/content/notifications",
      value: notifsPub,
      sub: `${notifs.length} total`,
    },
    {
      key: "downloads" as const,
      perm: "downloads",
      icon: <FileDown className="w-3.5 h-3.5" />,
      label: "Downloads",
      href: "/admin/content/downloads",
      value: dlsPub,
      sub: `${dls.length} total`,
    },
  ];

  const stats = allStats.filter(({ perm }) => can(superAdmin, permissions, perm));

  const allActions = [
    { label: "New notification", href: "/admin/content/notifications/new", perm: "notifications" },
    { label: "New event",        href: "/admin/content/events/new",        perm: "events" },
    { label: "New programme",    href: "/admin/content/programs/new",      perm: "programs" },
    { label: "Add download",     href: "/admin/content/downloads/new",     perm: "downloads" },
  ];
  const actions = allActions.filter(({ perm }) => can(superAdmin, permissions, perm));

  return (
    <div className="space-y-3">
      {/* Application overview — only if user has applications access */}
      {hasApplications && (
        <div className="px-5 py-4 rounded-2xl" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-text-secondary)" }}>
              Applications
            </p>
            <Link href="/admin/applications" className="text-[10px] font-semibold hover:underline" style={{ color: "var(--color-brand-600)" }}>
              View all
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { label: "Total",     value: subs.length, color: "var(--color-brand-950)" },
              { label: "Pending",   value: pending,   color: pending > 0   ? "#d97706" : "var(--color-text-secondary)" },
              { label: "This week", value: thisWeek,  color: thisWeek > 0  ? "#2563eb" : "var(--color-text-secondary)" },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <p className="text-xl font-black tabular-nums leading-tight" style={{ color }}>{value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Site stats — only sections user can access */}
      {stats.length > 0 && (
        <div className="px-4 py-4 rounded-2xl" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--color-text-secondary)" }}>
            Site content
          </p>
          <div>
            {stats.map(({ key, icon, label, href, value, sub, alert }) => {
              const colors = STAT_COLORS[key];
              return (
                <Link
                  key={label}
                  href={href}
                  className="grid items-center py-1.5 rounded-xl transition-colors hover:bg-[var(--color-surface-tint)]"
                  style={{ gridTemplateColumns: "26px 1fr 58px 28px" }}
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: alert ? "#fff7ed" : colors.bg, color: alert ? "#d97706" : colors.icon }}
                  >
                    {icon}
                  </span>
                  <span className="text-xs font-medium truncate pl-2 pr-1" style={{ color: "var(--color-brand-950)" }}>
                    {label}
                  </span>
                  <span className="text-[10px] whitespace-nowrap text-right tabular-nums" style={{ color: "var(--color-text-secondary)" }}>
                    {sub}
                  </span>
                  <span
                    className="text-xs font-black tabular-nums text-right"
                    style={{ color: alert ? "#d97706" : "var(--color-brand-800)" }}
                  >
                    {value}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions — only what user can create */}
      {actions.length > 0 && (
        <div className="px-5 py-4 rounded-2xl" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--color-text-secondary)" }}>
            Quick actions
          </p>
          <div className="grid grid-cols-2 gap-2">
            {actions.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center justify-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-xl text-center transition-colors hover:opacity-80"
                style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
              >
                <Plus className="w-3 h-3 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* View live site */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full text-xs font-semibold px-3 py-2.5 rounded-xl transition-opacity hover:opacity-80"
        style={{ backgroundColor: "var(--color-brand-800)", color: "white" }}
      >
        <Globe className="w-3.5 h-3.5" />
        View live site
      </a>
    </div>
  );
}

interface AdminRightPanelProps {
  superAdmin: boolean;
  permissions: string[];
}

export async function AdminRightPanel({ superAdmin, permissions }: AdminRightPanelProps) {
  return (
    <aside
      className="hidden xl:flex flex-col shrink-0 overflow-y-auto"
      style={{ width: "300px", borderLeft: "1px solid var(--color-border-subtle)", backgroundColor: "var(--color-surface-card)" }}
    >
      {/* Header — logo + name */}
      <div
        className="flex items-center gap-3 px-5 py-4 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
      >
        <Image src="/logo.png" alt="IC IITP" width={32} height={32} className="rounded-lg shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-black leading-tight truncate" style={{ color: "var(--color-brand-950)" }}>IC-IITP</p>
          <p className="text-[10px] leading-tight truncate" style={{ color: "var(--color-text-secondary)" }}>Admin dashboard</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <ClockWidget />
        <Suspense fallback={<StatsSkeletons />}>
          <SiteStats superAdmin={superAdmin} permissions={permissions} />
        </Suspense>
      </div>
    </aside>
  );
}

function StatsSkeletons() {
  return (
    <div className="space-y-3 animate-pulse">
      {[88, 220, 112].map((h) => (
        <div key={h} className="rounded-2xl" style={{ height: h, backgroundColor: "var(--color-surface-tint)" }} />
      ))}
    </div>
  );
}
