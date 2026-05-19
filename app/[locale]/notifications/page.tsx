import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getAllNotifications, isNotificationActive } from "@/lib/content";
import { getAllWpNotifications } from "@/lib/cms/wp-notifications";
import { getPublishedNotifications } from "@/lib/cms/notifications";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { Bell, ArrowRight } from "lucide-react";
import { tsToMs, fmtDate } from "@/lib/format";
import { autoDateBadge, badgeStyle } from "@/lib/badge-utils";

interface Props { params: Promise<{ locale: string }> }

export const revalidate = 60; // ISR: re-fetch at most once per minute

export const metadata: Metadata = {
  title: "Notifications",
  description: "Current notifications, career openings, calls for proposals, and tender notices from IC IITP.",
};

/** Builds a "DD MMM YYYY – DD MMM YYYY" or "Deadline: …" string from CMS timestamps. */
function buildCmsDateStr(validFrom: unknown, deadline: unknown): string {
  const from = tsToMs(validFrom) ? fmtDate(validFrom) : "";
  const dl = tsToMs(deadline) ? fmtDate(deadline) : "";
  if (from && dl) return `${from} – ${dl}`;
  if (dl) return `Deadline: ${dl}`;
  if (from) return `From: ${from}`;
  return "";
}

/** Active = published, validFrom (if set) reached, deadline (if set) not yet passed. */
function isCmsActive(deadline: unknown, validFrom: unknown): boolean {
  const now = Date.now();
  const dl = tsToMs(deadline);
  const vf = tsToMs(validFrom);
  if (dl && dl < now) return false;
  if (vf && vf > now) return false;
  return true;
}

type AnyNotif =
  | { kind: "static"; n: import("@/lib/content").Notification; sortMs: number }
  | { kind: "cms"; n: import("@/lib/cms/notifications").CmsNotificationDoc | import("@/lib/cms/wp-notifications").WpNotificationDoc; sortMs: number };

const STATIC_HREFS: Record<string, string> = {
  careers: "/notifications/careers",
  "call-for-proposals": "/notifications/call-for-proposals",
  "niq-tender": "/notifications/niq-tender",
};

function staticHref(slug: string): string {
  // Only known static slugs route to their dedicated pages — unknown slugs
  // would collide with the CMS `[id]` dynamic route and 404.
  return STATIC_HREFS[slug] ?? `/notifications/${slug}`;
}

export default async function NotificationsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [staticNotifs, cmsNotifs] = await Promise.all([
    Promise.resolve(getAllNotifications(locale)),
    getAllWpNotifications().catch(() => getPublishedNotifications().catch(() => [])),
  ]);

  const all: AnyNotif[] = [
    ...cmsNotifs.map((n) => ({ kind: "cms" as const, n, sortMs: tsToMs((n as import("@/lib/cms/notifications").CmsNotificationDoc).createdAt ?? n.validFrom) })),
    ...staticNotifs.map((n) => ({
      kind: "static" as const,
      n,
      sortMs: new Date(n.validFrom).getTime() || 0,
    })),
  ];

  const active = all
    .filter((item) =>
      item.kind === "cms"
        ? isCmsActive(item.n.deadline, item.n.validFrom)
        : isNotificationActive(item.n)
    )
    .sort((a, b) => b.sortMs - a.sortMs);

  const archived = all
    .filter((item) =>
      item.kind === "cms"
        ? !isCmsActive(item.n.deadline, item.n.validFrom)
        : !isNotificationActive(item.n)
    )
    .sort((a, b) => b.sortMs - a.sortMs);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications" }]} />

      <header className="mb-10">
        <h1 className="text-4xl font-black text-[--color-brand-800] mb-4">Notifications</h1>
        <p className="text-lg text-[--color-text-subtle] max-w-xl">
          Career openings, calls for proposals, and procurement notices from IC IITP.
        </p>
      </header>

      <section aria-labelledby="active-notifs" className="mb-12">
        <h2 id="active-notifs" className="text-xl font-bold text-[--color-text] mb-5">Active Notices</h2>
        {active.length === 0 ? (
          <p className="text-sm text-[--color-muted] py-6 text-center rounded-[--radius-xl] border border-[--color-border]">
            No active notices at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {active.map((item) =>
              item.kind === "cms" ? (
                <NotifCard
                  key={`cms-${item.n.id}`}
                  href={`/notifications/${item.n.id}`}
                  title={item.n.title}
                  subtitle={item.n.body}
                  badge={item.n.category}
                  status="active"
                  dateStr={buildCmsDateStr(item.n.validFrom, item.n.deadline)}
                  customBadge={item.n.customBadge}
                  deadline={item.n.deadline}
                  validFrom={item.n.validFrom}
                />
              ) : (
                <NotifCard
                  key={`s-${item.n.slug}`}
                  href={staticHref(item.n.slug)}
                  title={item.n.title}
                  subtitle={item.n.summary}
                  status="active"
                  dateStr={`${fmtDate(item.n.validFrom)} – ${fmtDate(item.n.validTo)}`}
                />
              )
            )}
          </div>
        )}
      </section>

      {archived.length > 0 && (
        <section aria-labelledby="archived-notifs">
          <h2 id="archived-notifs" className="text-xl font-bold text-[--color-text] mb-5">Archive</h2>
          <div className="space-y-3">
            {archived.map((item) =>
              item.kind === "cms" ? (
                <NotifCard
                  key={`cms-arch-${item.n.id}`}
                  href={`/notifications/${item.n.id}`}
                  title={item.n.title}
                  subtitle={item.n.body}
                  badge={item.n.category}
                  status="completed"
                  dateStr={buildCmsDateStr(item.n.validFrom, item.n.deadline)}
                  customBadge={item.n.customBadge}
                  deadline={item.n.deadline}
                  validFrom={item.n.validFrom}
                />
              ) : (
                <NotifCard
                  key={`s-arch-${item.n.slug}`}
                  href={staticHref(item.n.slug)}
                  title={item.n.title}
                  subtitle={item.n.summary}
                  status="completed"
                  dateStr={`${fmtDate(item.n.validFrom)} – ${fmtDate(item.n.validTo)}`}
                />
              )
            )}
          </div>
        </section>
      )}
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
