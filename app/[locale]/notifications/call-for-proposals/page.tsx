import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getNotification, isNotificationActive } from "@/lib/content";
import { getNotificationsByType } from "@/lib/cms/notifications";
import { Breadcrumb } from "@/components/breadcrumb";
import { ExternalLink } from "@/components/external-link";
import { FileDown } from "lucide-react";
import { fmtDate, tsToMs } from "@/lib/format";
import type { CmsNotificationDoc } from "@/lib/cms/notifications";

export const revalidate = 60; // ISR: re-fetch at most once per minute

interface Props { params: Promise<{ locale: string }> }
const SLUG = "call-for-proposals";
const CMS_TYPE = "proposal" as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const n = getNotification(SLUG, locale);
  return { title: n.title, description: n.summary };
}

function isCmsActive(n: CmsNotificationDoc): boolean {
  const dl = tsToMs(n.deadline);
  return !(dl && dl < Date.now());
}

function CmsNotificationCard({ n }: { n: CmsNotificationDoc }) {
  const active = isCmsActive(n);
  return (
    <article className="mb-10 pb-10 border-b border-[var(--color-border)] last:border-0 last:mb-0 last:pb-0">
      <header className="mb-6 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-800)]">Call for Proposals</span>
          {active ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">Active</span>
                  : <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Expired</span>}
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">{n.title}</h2>
        {n.deadline && <p className="text-sm text-[var(--color-muted)]">Deadline: {fmtDate(n.deadline)}</p>}
      </header>
      <div className="prose max-w-none text-[var(--color-text-subtle)] leading-relaxed mb-6 whitespace-pre-line">{n.body}</div>
      {n.attachmentUrl && (
        <div className="mb-6">
          <h3 className="text-base font-bold text-[var(--color-text)] mb-3">Download</h3>
          <a href={n.attachmentUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:bg-[var(--color-brand-50)] hover:border-[var(--color-brand-300)] transition-all">
            <FileDown className="w-5 h-5 text-[var(--color-brand-600)]" aria-hidden="true" />
            <span className="font-medium text-sm text-[var(--color-text)]">View / Download</span>
          </a>
        </div>
      )}
      {n.externalUrl && (
        <div className="mb-6">
          <h3 className="text-base font-bold text-[var(--color-text)] mb-3">External Portal</h3>
          <ExternalLink href={n.externalUrl} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold hover:opacity-90" style={{ backgroundColor: "#3a5214" }}>
            Visit Portal
          </ExternalLink>
        </div>
      )}
      {n.contactEmail && <p className="text-sm text-[var(--color-text-subtle)]">Contact: <a href={`mailto:${n.contactEmail}`} className="text-[var(--color-primary)] hover:underline">{n.contactEmail}</a></p>}
    </article>
  );
}

export default async function NotificationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let cmsItems: CmsNotificationDoc[] = [];
  try { cmsItems = await getNotificationsByType(CMS_TYPE); } catch {}

  if (cmsItems.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications", href: "/notifications" }, { label: "Call for Proposals" }]} />
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Call for Proposals</h1>
          <p className="text-sm text-[var(--color-muted)]">Open calls for incubation, funding, and collaboration from IC IITP.</p>
        </header>
        {cmsItems.map((n) => <CmsNotificationCard key={n.id} n={n} />)}
      </div>
    );
  }

  // Static fallback
  let n;
  try { n = getNotification(SLUG, locale); } catch { notFound(); }
  const active = isNotificationActive(n);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications", href: "/notifications" }, { label: "Call for Proposals" }]} />
      <header className="mb-8 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-800)]">{n.purpose}</span>
          {active ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">Active</span>
                  : <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Expired</span>}
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">{n.title}</h1>
        <p className="text-sm text-[var(--color-muted)]">Valid: {new Date(n.validFrom).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })} – {new Date(n.validTo).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</p>
      </header>
      <div className="prose max-w-none text-[var(--color-text-subtle)] leading-relaxed mb-8 whitespace-pre-line">{n.body}</div>
      {/* Proposals table */}
      {n.proposalsTable && n.proposalsTable.length > 0 && (
        <section className="mb-8 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[520px]" style={{ border: "1px solid #e8f0e0" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f7e6" }}>
                <th className="text-left px-4 py-3 font-bold" style={{ color: "#1c2e06", borderBottom: "2px solid #d4e6c4", width: "60%" }}>Proposals</th>
                <th className="text-center px-4 py-3 font-bold" style={{ color: "#1c2e06", borderBottom: "2px solid #d4e6c4" }}>Details</th>
                <th className="text-center px-4 py-3 font-bold" style={{ color: "#1c2e06", borderBottom: "2px solid #d4e6c4" }}>Application Form</th>
              </tr>
            </thead>
            <tbody>
              {n.proposalsTable.map((row, i) => (
                <tr key={row.sn} style={{ borderBottom: "1px solid #e8f0e0", backgroundColor: i % 2 === 0 ? "white" : "#fafdf7" }}>
                  <td className="px-4 py-4">
                    <p className="font-semibold leading-snug" style={{ color: "#1c2e06" }}>{row.title}</p>
                    {row.note && <p className="text-xs mt-1" style={{ color: "#7a8e6a" }}>{row.note}</p>}
                    {row.moreDetailsUrl && (
                      <a href={row.moreDetailsUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-medium mt-1 inline-block hover:underline" style={{ color: "#f79420" }}>
                        More Details
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <a href={row.detailsUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-sm hover:underline" style={{ color: "#f79420" }}>
                      <FileDown className="w-4 h-4" aria-hidden="true" /> PDF
                    </a>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {row.applicationFormUrl ? (
                      <a href={row.applicationFormUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-sm hover:underline" style={{ color: "#f79420" }}>
                        <FileDown className="w-4 h-4" aria-hidden="true" /> PDF
                      </a>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {n.externalUrl && <section className="mb-8"><h2 className="text-lg font-bold text-[var(--color-text)] mb-3">External Portal</h2><ExternalLink href={n.externalUrl} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold hover:opacity-90" style={{ backgroundColor: "#3a5214" }}>Visit Portal</ExternalLink></section>}
      {n.contactEmail && <p className="text-sm text-[var(--color-text-subtle)]">Contact: <a href={`mailto:${n.contactEmail}`} className="text-[var(--color-primary)] hover:underline">{n.contactEmail}</a></p>}
    </div>
  );
}
