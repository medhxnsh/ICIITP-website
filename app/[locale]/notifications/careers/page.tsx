import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getNotification, isNotificationActive } from "@/lib/content";
import type { RecruitmentEntry } from "@/lib/content";
import { getNotificationsByType } from "@/lib/cms/notifications";
import { getDownloadsByPage } from "@/lib/cms/downloads";
import { Breadcrumb } from "@/components/breadcrumb";
import { ExternalLink } from "@/components/external-link";
import { FileDown, ExternalLink as ExternalLinkIcon } from "lucide-react";
import { fmtDate, tsToMs } from "@/lib/format";
import type { CmsNotificationDoc } from "@/lib/cms/notifications";

export const revalidate = 60; // ISR: re-fetch at most once per minute

interface Props { params: Promise<{ locale: string }> }
const SLUG = "careers";
const CMS_TYPE = "careers" as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const n = getNotification(SLUG, locale);
  return { title: n.title, description: n.summary };
}

function isCmsActive(n: CmsNotificationDoc): boolean {
  const now = Date.now();
  const dl = tsToMs(n.deadline);
  const vf = tsToMs(n.validFrom);
  if (dl && dl < now) return false;
  if (vf && vf > now) return false;
  return true;
}

function CmsNotificationCard({ n }: { n: CmsNotificationDoc }) {
  const active = isCmsActive(n);
  return (
    <article className="mb-10 pb-10 border-b border-[var(--color-border)] last:border-0 last:mb-0 last:pb-0">
      <header className="mb-6 pb-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--color-brand-100)] text-[var(--color-brand-800)]">Careers</span>
          {active
            ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">Active</span>
            : <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Expired</span>}
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">{n.title}</h2>
        {(n.validFrom || n.deadline) && (
          <p className="text-sm text-[var(--color-muted)]">
            {n.validFrom && <>Valid from: {fmtDate(n.validFrom)}</>}
            {n.validFrom && n.deadline && " – "}
            {n.deadline && <>Deadline: {fmtDate(n.deadline)}</>}
          </p>
        )}
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
      {n.contactEmail && (
        <p className="text-sm text-[var(--color-text-subtle)]">
          Contact: <a href={`mailto:${n.contactEmail}`} className="text-[var(--color-primary)] hover:underline">{n.contactEmail}</a>
        </p>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: RecruitmentEntry["status"] }) {
  if (status === "open") return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Open</span>;
  if (status === "cancelled") return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Cancelled</span>;
  return <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Closed</span>;
}

function DocLink({ doc }: { doc: RecruitmentEntry["documents"][number] }) {
  const isLink = doc.type === "Link";
  return (
    <a
      href={doc.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border transition-colors hover:bg-[#f0f7e6]"
      style={{ borderColor: "#d4e6c4", color: "#3a5214" }}
    >
      {isLink ? <ExternalLinkIcon className="w-3 h-3" aria-hidden="true" /> : <FileDown className="w-3 h-3" aria-hidden="true" />}
      {doc.label}
      {!isLink && <span className="text-[10px] font-bold ml-0.5 opacity-60">{doc.type}</span>}
    </a>
  );
}

function RecruitmentTable({ entries }: { entries: RecruitmentEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "#d4e6c4" }}>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr style={{ backgroundColor: "#3a5214", color: "white" }}>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider w-8">S.No.</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Position / Advertisement</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">Notification Date</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap">Last Date</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Documents</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((row, i) => (
            <tr
              key={row.sn}
              style={{
                backgroundColor: i % 2 === 0 ? "white" : "#f9fbf6",
                borderTop: "1px solid #e8f0e0",
              }}
            >
              <td className="px-3 py-3.5 text-center text-xs text-gray-500 font-medium">{row.sn}</td>
              <td className="px-4 py-3.5 font-medium text-gray-900">{row.position}</td>
              <td className="px-3 py-3.5 text-xs text-gray-600 whitespace-nowrap">{row.notificationDate ?? "—"}</td>
              <td className="px-3 py-3.5 text-xs text-gray-600 whitespace-nowrap">{row.deadline ?? "—"}</td>
              <td className="px-3 py-3.5"><StatusBadge status={row.status} /></td>
              <td className="px-4 py-3.5">
                <div className="flex flex-wrap gap-1.5">
                  {row.documents.map((doc) => <DocLink key={doc.url} doc={doc} />)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function NotificationPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let cmsItems: CmsNotificationDoc[] = [];
  try { cmsItems = await getNotificationsByType(CMS_TYPE); } catch {}
  const cmsDocs = await getDownloadsByPage("notifications/careers").catch(() => []);

  if (cmsItems.length > 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications", href: "/notifications" }, { label: "Careers" }]} />
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">Careers</h1>
          <p className="text-sm text-[var(--color-muted)]">Job openings and walk-in interviews at IC IITP.</p>
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Notifications", href: "/notifications" }, { label: "Careers" }]} />

      <header className="mb-8 pb-6 border-b" style={{ borderColor: "#e8f0e0" }}>
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#f0f7e6", color: "#3a5214" }}>{n.purpose}</span>
          {active ? <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">Active</span>
                  : <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">Expired</span>}
        </div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: "#1c2e06" }}>{n.title}</h1>
        <p className="text-sm" style={{ color: "#7a8e6a" }}>
          Applications open until:{" "}
          <span className="font-semibold" style={{ color: "#3a5214" }}>
            {new Date(n.validTo).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </p>
      </header>

      <div className="prose max-w-none leading-relaxed mb-8 whitespace-pre-line text-sm" style={{ color: "#4a5e2a" }}>{n.body}</div>

      {/* Recruitment table */}
      {n.recruitmentTable && n.recruitmentTable.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1c2e06" }}>Recruitment Notices</h2>
          <RecruitmentTable entries={n.recruitmentTable} />
          <p className="mt-3 text-xs" style={{ color: "#9aab88" }}>
            Note: Please use Mozilla Firefox or Internet Explorer for downloading Word (.docx) files.
          </p>
        </section>
      )}

      {/* Legacy downloads */}
      {n.downloads && n.downloads.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1c2e06" }}>Downloads</h2>
          <div className="space-y-3">
            {n.downloads.map((d) => (
              <a key={d.title} href={d.path} download
                className="flex items-center gap-3 p-4 rounded-xl border hover:bg-[#f0f7e6] transition-colors"
                style={{ borderColor: "#e8f0e0" }}>
                <FileDown className="w-5 h-5 shrink-0" style={{ color: "#3a5214" }} aria-hidden="true" />
                <div>
                  <p className="font-medium text-sm" style={{ color: "#1c2e06" }}>{d.title}</p>
                  <p className="text-xs" style={{ color: "#7a8e6a" }}>{d.format}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {n.externalUrl && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#1c2e06" }}>External Portal</h2>
          <ExternalLink href={n.externalUrl} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white text-sm font-semibold hover:opacity-90" style={{ backgroundColor: "#3a5214" }}>
            Visit Portal
          </ExternalLink>
        </section>
      )}

      {cmsDocs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: "#1c2e06" }}>Forms &amp; Documents</h2>
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

      {n.contactEmail && (
        <p className="text-sm" style={{ color: "#7a8e6a" }}>
          Contact:{" "}
          <a href={`mailto:${n.contactEmail}`} className="hover:underline" style={{ color: "#3a5214" }}>{n.contactEmail}</a>
        </p>
      )}
    </div>
  );
}
