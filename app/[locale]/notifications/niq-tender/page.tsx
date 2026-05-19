import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getNotification, isNotificationActive } from "@/lib/content";
import { getWpNotificationsByType } from "@/lib/cms/wp-notifications";
import { getNotificationsByType } from "@/lib/cms/notifications";
import { getDownloadsByPage } from "@/lib/cms/downloads";
import { Breadcrumb } from "@/components/breadcrumb";
import { ExternalLink } from "@/components/external-link";
import { FileDown } from "lucide-react";
import { fmtDate, tsToMs } from "@/lib/format";
import type { CmsNotificationDoc } from "@/lib/cms/notifications";

export const revalidate = 60; // ISR: re-fetch at most once per minute

interface Props { params: Promise<{ locale: string }> }
const SLUG = "niq-tender";
const CMS_TYPE = "tender" as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const n = getNotification(SLUG, locale);
  return { title: n.title, description: n.summary };
}

function isCmsActive(n: { deadline: unknown; validFrom?: unknown }): boolean {
  const dl = tsToMs(n.deadline);
  return !(dl && dl < Date.now());
}

function CmsNotificationCard({ n }: { n: CmsNotificationDoc | import("@/lib/cms/wp-notifications").WpNotificationDoc }) {
  const active = isCmsActive(n);
  return (
    <article className="mb-10 pb-10 border-b border-[var(--color-border)] last:border-0 last:mb-0 last:pb-0">
      <header className="mb-6 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-800)]">NIQ / Tender</span>
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

  let cmsItems: (CmsNotificationDoc | import("@/lib/cms/wp-notifications").WpNotificationDoc)[] = [];
  try { cmsItems = await getWpNotificationsByType(CMS_TYPE); } catch {
    try { cmsItems = await getNotificationsByType(CMS_TYPE); } catch {}
  }
  const cmsDocs = await getDownloadsByPage("notifications/niq-tender").catch(() => []);

  if (cmsItems.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications", href: "/notifications" }, { label: "NIQ / Tender" }]} />
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">NIQ / Tender</h1>
          <p className="text-sm text-[var(--color-muted)]">Notices inviting quotations and tender documents from IC IITP.</p>
        </header>
        {cmsItems.map((n) => <CmsNotificationCard key={n.id} n={n} />)}
      </div>
    );
  }

  let n;
  try { n = getNotification(SLUG, locale); } catch { notFound(); }
  const active = isNotificationActive(n);
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications", href: "/notifications" }, { label: "NIQ / Tender" }]} />
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
      {n.downloads && n.downloads.length > 0 && (
        <section className="mb-8"><h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Downloads</h2>
          <div className="space-y-3">{n.downloads.map(d => (
            <a key={d.title} href={d.path} download className="flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] hover:bg-[var(--color-brand-50)] hover:border-[var(--color-brand-300)] transition-all">
              <FileDown className="w-5 h-5 text-[var(--color-brand-600)]" aria-hidden="true" />
              <div><p className="font-medium text-sm text-[var(--color-text)]">{d.title}</p><p className="text-xs text-[var(--color-muted)]">{d.format}</p></div>
            </a>))}</div>
        </section>
      )}
      {n.externalUrl && <section className="mb-8"><h2 className="text-lg font-bold text-[var(--color-text)] mb-3">External Portal</h2><ExternalLink href={n.externalUrl} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold hover:opacity-90" style={{ backgroundColor: "#3a5214" }}>Visit Portal</ExternalLink></section>}
      {cmsDocs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-[var(--color-text)] mb-4">Forms &amp; Documents</h2>
          <div className="space-y-2">
            {cmsDocs.map((doc) => (
              <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border hover:shadow-sm transition-shadow"
                style={{ borderColor: "#e8f0e0", backgroundColor: "white" }}>
                <FileDown className="w-5 h-5 shrink-0" style={{ color: "#3a5214" }} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm" style={{ color: "#1c2e06" }}>{doc.title}</p>
                  {doc.purpose && <p className="text-xs mt-0.5" style={{ color: "#7a8e6a" }}>{doc.purpose}</p>}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}>{doc.fileType}</span>
              </a>
            ))}
          </div>
        </section>
      )}
      {n.contactEmail && <p className="text-sm text-[var(--color-text-subtle)]">Contact: <a href={`mailto:${n.contactEmail}`} className="text-[var(--color-primary)] hover:underline">{n.contactEmail}</a></p>}
    </div>
  );
}
