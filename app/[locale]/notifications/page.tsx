import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPublishedNotifications } from "@/lib/cms/notifications";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { Bell, ArrowRight } from "lucide-react";
import { tsToMs, fmtDate } from "@/lib/format";
import { autoDateBadge, badgeStyle } from "@/lib/badge-utils";
import { Reveal } from "@/components/reveal";

interface Props { params: Promise<{ locale: string }> }

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Notifications",
  description: "Current notifications, career openings, calls for proposals, and tender notices from IC IITP.",
};

function buildDateStr(validFrom: unknown, deadline: unknown): string {
  const from = tsToMs(validFrom) ? fmtDate(validFrom) : "";
  const dl = tsToMs(deadline) ? fmtDate(deadline) : "";
  if (from && dl) return `${from} – ${dl}`;
  if (dl) return `Deadline: ${dl}`;
  if (from) return `From: ${from}`;
  return "";
}

function isActive(deadline: unknown, validFrom: unknown): boolean {
  const now = Date.now();
  const dl = tsToMs(deadline);
  const vf = tsToMs(validFrom);
  if (dl && dl < now) return false;
  if (vf && vf > now) return false;
  return true;
}

export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const all = await getPublishedNotifications().catch(() => []);

  const active = all
    .filter((n) => isActive(n.deadline, n.validFrom))
    .sort((a, b) => tsToMs(b.createdAt) - tsToMs(a.createdAt));

  const archived = all
    .filter((n) => !isActive(n.deadline, n.validFrom))
    .sort((a, b) => tsToMs(b.createdAt) - tsToMs(a.createdAt));

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications" }]} variant="light" />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <Bell className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              From IC IITP
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
              Notifications
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              Career openings, calls for proposals, and procurement notices from IC IITP.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section aria-labelledby="active-notifs" className="mb-12">
          <h2 id="active-notifs" className="text-xl font-bold text-[--color-text] mb-5">Active Notices</h2>
          {active.length === 0 ? (
            <p className="text-sm text-[--color-muted] py-6 text-center rounded-[--radius-xl] border border-[--color-border]">
              No active notices at this time.
            </p>
          ) : (
            <div className="space-y-3">
              {active.map((n) => (
                <NotifCard
                  key={n.id}
                  href={`/notifications/${n.id}`}
                  title={n.title}
                  subtitle={n.summary || n.body}
                  badge={n.category}
                  status="active"
                  dateStr={buildDateStr(n.validFrom, n.deadline)}
                  customBadge={n.customBadge}
                  deadline={n.deadline}
                  validFrom={n.validFrom}
                />
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="archived-notifs">
          <h2 id="archived-notifs" className="text-xl font-bold text-[--color-text] mb-5">Archive</h2>
          {archived.length === 0 ? (
            <p className="text-sm text-[--color-muted] py-6 text-center rounded-[--radius-xl] border border-[--color-border]">
              No archived notices.
            </p>
          ) : (
            <div className="space-y-3">
              {archived.map((n) => (
                <NotifCard
                  key={n.id}
                  href={`/notifications/${n.id}`}
                  title={n.title}
                  subtitle={n.summary || n.body}
                  badge={n.category}
                  status="completed"
                  dateStr={buildDateStr(n.validFrom, n.deadline)}
                  customBadge={n.customBadge}
                  deadline={n.deadline}
                  validFrom={n.validFrom}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function NotifCard({
  href, title, subtitle, badge, status, dateStr, customBadge, deadline, validFrom,
}: {
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
  status: "active" | "completed";
  dateStr: string;
  customBadge?: string;
  deadline?: unknown;
  validFrom?: unknown;
}) {
  const autoBadge = autoDateBadge({ deadline, validFrom });
  return (
    <Link
      href={href}
      className="group flex gap-4 p-5 rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] hover:border-[--color-brand-300] hover:shadow-md transition-all"
    >
      <Bell className="w-5 h-5 text-[--color-muted] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h3 className="font-semibold text-[--color-text] group-hover:text-[--color-primary] transition-colors leading-snug">
              {title}
            </h3>
            {badge && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[--color-brand-100] text-[--color-brand-800] uppercase tracking-wide shrink-0">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {autoBadge ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0" style={badgeStyle(autoBadge.variant)}>
                {autoBadge.label}
              </span>
            ) : status === "active" ? (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 shrink-0">Active</span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">Completed</span>
            )}
            {customBadge && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full shrink-0" style={badgeStyle("orange")}>
                {customBadge}
              </span>
            )}
          </div>
        </div>
        {subtitle && (
          <p className="text-sm text-[--color-text-subtle] line-clamp-2">{subtitle}</p>
        )}
        {dateStr && (
          <p className="text-xs text-[--color-muted] mt-1">{dateStr}</p>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-[--color-muted] shrink-0 mt-1 group-hover:text-[--color-primary] transition-colors" aria-hidden="true" />
    </Link>
  );
}
