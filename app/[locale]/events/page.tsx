import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPublishedEvents, resolveStatus } from "@/lib/cms/events";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { Calendar, ArrowRight } from "lucide-react";
import { eventStatusBadge, badgeStyle } from "@/lib/badge-utils";
import { Reveal } from "@/components/reveal";

export const revalidate = 60; // ISR: re-fetch at most once per minute

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Events",
  description: "Events at IC IITP: MedTech School, EDPI, Ideathon, and Technical Training Programmes.",
};

interface DisplayEvent {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  status: string;
  organiser: string;
  archived: boolean;
  customBadge?: string;
}


export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let allEvents: DisplayEvent[] = [];
  try {
    const raw = await getPublishedEvents();
    allEvents = raw.map((ev) => {
      const status = resolveStatus(ev);
      return {
        slug: ev.slug,
        title: ev.title,
        tagline: ev.tagline,
        category: ev.category,
        status,
        organiser: ev.organiser ?? "IC IITP",
        archived: status === "Closed",
        customBadge: ev.customBadge,
      };
    });
  } catch {
    // CMS unavailable
  }

  const all = allEvents;
  const active = all.filter((e) => !e.archived);
  const archived = all.filter((e) => e.archived);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Events" }]} variant="light" />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              From IC IITP
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
              Events
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              Competitions, training programmes, and entrepreneurship courses organised by IC IITP.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {active.length > 0 && (
        <section aria-labelledby="active-events-heading" className="mb-12">
          <h2 id="active-events-heading" className="text-xl font-bold text-[--color-text] mb-5">
            Current &amp; Upcoming
          </h2>
          <div className="space-y-4">
            {active.map((event) => <EventCard key={event.slug} event={event} />)}
          </div>
        </section>
      )}

      {archived.length > 0 && (
        <section aria-labelledby="archived-events-heading">
          <h2 id="archived-events-heading" className="text-xl font-bold text-[--color-text] mb-5">
            Past Events
            <Link href="/events/archive" className="ml-3 text-sm font-medium text-[--color-primary] hover:underline">
              View archive →
            </Link>
          </h2>
          <div className="space-y-4">
            {archived.map((event) => <EventCard key={event.slug} event={event} />)}
          </div>
        </section>
      )}
      </div>
    </div>
  );
}

function EventCard({ event }: { event: DisplayEvent }) {
  const statusBadge = eventStatusBadge(event.status);
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex gap-4 p-5 rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] hover:border-[--color-brand-300] hover:shadow-md transition-all"
    >
      <div className="shrink-0 w-10 h-10 rounded-[--radius-md] bg-[--color-brand-100] text-[--color-brand-800] flex items-center justify-center">
        <Calendar className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <h3 className="font-bold text-[--color-text] group-hover:text-[--color-primary] transition-colors leading-snug">
            {event.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={badgeStyle(statusBadge.variant)}>
              {statusBadge.label}
            </span>
            {event.customBadge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={badgeStyle("orange")}>
                {event.customBadge}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-[--color-text-subtle] line-clamp-2 mb-2">{event.tagline}</p>
        <p className="text-xs text-[--color-muted]">
          {event.organiser} · {event.category}
        </p>
      </div>
      <ArrowRight className="w-4 h-4 text-[--color-muted] shrink-0 mt-1 group-hover:text-[--color-primary] transition-colors" aria-hidden="true" />
    </Link>
  );
}
