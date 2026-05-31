import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPublishedEvents, resolveStatus } from "@/lib/cms/events";
import { Link } from "@/i18n/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { Calendar } from "lucide-react";

export const revalidate = 60;

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Events Archive",
  description: "Past events organised by IC IITP.",
};

export default async function EventsArchivePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const all = await getPublishedEvents().catch(() => []);
  const archived = all.filter((e) => resolveStatus(e) === "Closed" || resolveStatus(e) === "Concluded" as never);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: "Archive" }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-black text-[--color-brand-800] mb-3">Events Archive</h1>
        <p className="text-[--color-text-subtle]">Past events organised by IC IITP.</p>
      </header>
      {archived.length === 0 ? (
        <p className="text-[--color-muted]">No archived events yet.</p>
      ) : (
        <div className="space-y-4">
          {archived.map((event) => (
            <Link
              key={event.slug}
              href={`/events/${event.slug}`}
              className="flex gap-4 p-5 rounded-[--radius-xl] border border-[--color-border] bg-[--color-surface] hover:bg-[--color-surface-alt] transition-colors"
            >
              <Calendar className="w-5 h-5 text-[--color-muted] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-[--color-text] hover:text-[--color-primary] transition-colors">{event.title}</h3>
                <p className="text-sm text-[--color-text-subtle] mt-0.5">{event.tagline}</p>
                <p className="text-xs text-[--color-muted] mt-1">{event.category} · Concluded</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
