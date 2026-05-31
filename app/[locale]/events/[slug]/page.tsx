import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getEventBySlug, resolveStatus } from "@/lib/cms/events";
import { fmtDate } from "@/lib/format";
import { Breadcrumb } from "@/components/breadcrumb";
import { ExternalLink } from "@/components/external-link";
import { Calendar, Mail, Link2, MapPin, Clock, FileText } from "lucide-react";
import type { CustomField, FieldType } from "@/lib/cms/events";

export const revalidate = 60; // ISR: re-fetch at most once per minute

interface Props { params: Promise<{ locale: string; slug: string }> }


const STATUS_CLASS: Record<string, string> = {
  Upcoming:  "bg-blue-100 text-blue-800",
  Ongoing:   "bg-green-100 text-green-800",
  Closed:    "bg-gray-100 text-gray-600",
  Recurring: "bg-yellow-100 text-yellow-800",
};

function CustomFieldSection({ field }: { field: CustomField }) {
  const type: FieldType = field.type;
  return (
    <section aria-labelledby={`cf-${field.id}`}>
      <h2 id={`cf-${field.id}`} className="text-xl font-bold text-[var(--color-text)] mb-3">
        {field.label}
      </h2>
      {type === "text" && (
        <p className="text-[var(--color-text-subtle)] break-words">{field.value}</p>
      )}
      {type === "textarea" && (
        <p className="text-[var(--color-text-subtle)] leading-relaxed whitespace-pre-line break-words">{field.value}</p>
      )}
      {type === "url" && (
        <ExternalLink
          href={field.value}
          className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg"
          style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}
        >
          <Link2 className="w-3.5 h-3.5" aria-hidden="true" />
          {field.label}
        </ExternalLink>
      )}
      {type === "date" && (
        <p className="text-[var(--color-text-subtle)] flex items-center gap-2">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          {fmtDate(field.value)}
        </p>
      )}
      {type === "image" && field.value && (
        <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
          <img
            src={field.value}
            alt={field.label}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}
      {type === "list" && field.items.length > 0 && (
        <ul className="space-y-2">
          {field.items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-[var(--color-text-subtle)] break-words">
              <span className="text-[var(--color-brand-600)] shrink-0">·</span>
              <span className="break-words min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = await getEventBySlug(slug);
  if (!ev) return {};
  return { title: ev.title, description: ev.tagline };
}

export default async function CmsEventPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const ev = await getEventBySlug(slug);
  if (!ev) notFound();

  const resolved = resolveStatus(ev);
  const statusClass = STATUS_CLASS[resolved] ?? "bg-gray-100 text-gray-600";
  const sortedFields = [...(ev.customFields ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Events", href: "/events" },
          { label: ev.title },
        ]}
      />

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-800)]">
            {ev.category}
          </span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusClass}`}>
            {resolved}
          </span>
          {!ev.published && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
              Preview
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black text-[var(--color-brand-800)] mb-3 leading-tight">
          {ev.title}
        </h1>
        {ev.tagline && (
          <p className="text-[var(--color-text-subtle)] max-w-2xl">{ev.tagline}</p>
        )}
        {ev.closingDate && (
          <p className="mt-3 text-sm text-[var(--color-muted)] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {resolved === "Closed" ? "Closed on" : "Closes on"} {fmtDate(ev.closingDate)}
          </p>
        )}
      </header>

      {ev.coverImageUrl && (
        <div className="mb-8 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/7" }}>
          <img
            src={ev.coverImageUrl}
            alt={ev.title}
            className="w-full h-full object-cover object-center"
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 min-w-0">
          {ev.description && (
            <section aria-labelledby="about-ev">
              <h2 id="about-ev" className="text-xl font-bold text-[var(--color-text)] mb-3">About</h2>
              <p className="text-[var(--color-text-subtle)] leading-relaxed whitespace-pre-line break-words">{ev.description}</p>
            </section>
          )}

          {/* Rich structured extras — seeded events */}
          {ev.topics && ev.topics.length > 0 && (
            <section aria-labelledby="topics-ev">
              <h2 id="topics-ev" className="text-xl font-bold text-[var(--color-text)] mb-3">Topics Covered</h2>
              <ul className="space-y-2">
                {ev.topics.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-[var(--color-text-subtle)]">
                    <span className="text-[var(--color-brand-600)] shrink-0">·</span>{t}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {ev.highlights && ev.highlights.length > 0 && (
            <section aria-labelledby="highlights-ev">
              <h2 id="highlights-ev" className="text-xl font-bold text-[var(--color-text)] mb-3">Highlights</h2>
              <ul className="space-y-2">
                {ev.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-[var(--color-text-subtle)]">
                    <span className="text-[var(--color-brand-600)] shrink-0">✓</span>{h}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {ev.prizes && ev.prizes.length > 0 && (
            <section aria-labelledby="prizes-ev">
              <h2 id="prizes-ev" className="text-xl font-bold text-[var(--color-text)] mb-3">Prizes</h2>
              <ul className="space-y-2">
                {ev.prizes.map((p) => (
                  <li key={p.position} className="flex gap-3 text-sm">
                    <span className="font-bold text-[var(--color-brand-800)] w-8">{p.position}</span>
                    <span className="text-[var(--color-text-subtle)]">{p.prize}</span>
                  </li>
                ))}
              </ul>
              {ev.specialAward && <p className="text-sm text-[var(--color-text-subtle)] mt-2 italic">Special: {ev.specialAward}</p>}
            </section>
          )}
          {ev.fees && ev.fees.length > 0 && (
            <section aria-labelledby="fees-ev">
              <h2 id="fees-ev" className="text-xl font-bold text-[var(--color-text)] mb-3">Registration Fees</h2>
              <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)]">
                <table className="w-full text-sm">
                  <caption className="sr-only">Registration fees for {ev.title}</caption>
                  <thead>
                    <tr className="bg-[var(--color-surface-alt)]">
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">Category</th>
                      <th scope="col" className="px-4 py-3 text-left font-semibold text-[var(--color-text)]">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {ev.fees.map((f) => (
                      <tr key={f.category} className="bg-[var(--color-surface)]">
                        <td className="px-4 py-3 text-[var(--color-text-subtle)]">{f.category}</td>
                        <td className="px-4 py-3 font-bold text-[var(--color-brand-800)]">{f.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {ev.speakers && ev.speakers.length > 0 && (
            <section aria-labelledby="speakers-ev">
              <h2 id="speakers-ev" className="text-xl font-bold text-[var(--color-text)] mb-3">Speakers</h2>
              <ul className="space-y-2">
                {ev.speakers.map((s) => (
                  <li key={s.name} className="text-sm text-[var(--color-text-subtle)]">
                    <span className="font-medium text-[var(--color-text)]">{s.name}</span> — {s.affiliation}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Admin-added custom fields */}
          {sortedFields.map((field) => (
            <CustomFieldSection key={field.id} field={field} />
          ))}

          {ev.attachments && ev.attachments.length > 0 && (
            <section aria-labelledby="attachments-ev">
              <h2 id="attachments-ev" className="text-xl font-bold text-[var(--color-text)] mb-3">Downloads</h2>
              <div className="space-y-2">
                {ev.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand-300)] hover:bg-[var(--color-brand-50)] transition-all"
                  >
                    <FileText className="w-5 h-5 text-[var(--color-brand-600)] shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium text-[var(--color-text)]">{att.title || att.url}</span>
                    {att.type && (
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-subtle)]">
                        {att.type}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          {ev.applyUrl && resolved !== "Closed" && (
            <div className="rounded-xl text-white p-6" style={{ backgroundColor: "var(--color-brand-800)" }}>
              <h2 className="font-bold mb-3">Register Now</h2>
              <ExternalLink
                href={ev.applyUrl}
                className="inline-flex w-full justify-center px-4 py-2.5 rounded-[var(--radius-md)] bg-white text-[var(--color-brand-800)] font-semibold text-sm hover:bg-[var(--color-brand-100)] transition-colors"
              >
                Apply / Register
              </ExternalLink>
            </div>
          )}
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5">
            <h2 className="text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-3">Details</h2>
            <dl className="space-y-2 text-sm">
              <dt className="font-medium text-[var(--color-text)]">Organiser</dt>
              <dd className="text-[var(--color-text-subtle)] -mt-1">{ev.organiser ?? "IC IITP"}</dd>
              <dt className="font-medium text-[var(--color-text)]">Category</dt>
              <dd className="text-[var(--color-text-subtle)] -mt-1">{ev.category}</dd>
              {ev.duration && (
                <><dt className="font-medium text-[var(--color-text)]">Duration</dt>
                <dd className="text-[var(--color-text-subtle)] -mt-1 flex items-center gap-1"><Clock className="w-3 h-3" aria-hidden="true" />{ev.duration}</dd></>
              )}
              {ev.venue && (
                <><dt className="font-medium text-[var(--color-text)]">Venue</dt>
                <dd className="text-[var(--color-text-subtle)] -mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" aria-hidden="true" />{ev.venue}</dd></>
              )}
              {ev.mode && (
                <><dt className="font-medium text-[var(--color-text)]">Mode</dt>
                <dd className="text-[var(--color-text-subtle)] -mt-1">{ev.mode}</dd></>
              )}
              {ev.schedule && (
                <><dt className="font-medium text-[var(--color-text)]">Schedule</dt>
                <dd className="text-[var(--color-text-subtle)] -mt-1 flex items-center gap-1"><Calendar className="w-3 h-3" aria-hidden="true" />{ev.schedule}</dd></>
              )}
              {ev.contact && (
                <><dt className="font-medium text-[var(--color-text)]">Contact</dt>
                <dd className="-mt-1">
                  {ev.contact.includes("@") ? (
                    <a href={`mailto:${ev.contact}`} className="text-[var(--color-primary)] hover:underline text-xs flex items-center gap-1">
                      <Mail className="w-3 h-3" aria-hidden="true" />{ev.contact}
                    </a>
                  ) : (
                    <span className="text-[var(--color-text-subtle)] text-xs">{ev.contact}</span>
                  )}
                </dd></>
              )}
              {ev.contactPhone && (
                <><dt className="font-medium text-[var(--color-text)]">Phone</dt>
                <dd className="text-[var(--color-text-subtle)] -mt-1 text-xs">{ev.contactPhone}</dd></>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
