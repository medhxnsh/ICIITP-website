import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getNotificationById } from "@/lib/cms/notifications";
import type { ProposalEntry, RecruitmentEntry } from "@/lib/cms/notifications";
import { Breadcrumb } from "@/components/breadcrumb";
import { ExternalLink } from "@/components/external-link";
import { fmtDate } from "@/lib/format";
import { FileText, Mail, ExternalLink as ExternalLinkIcon, Calendar } from "lucide-react";

interface Props { params: Promise<{ locale: string; id: string }> }

export const revalidate = 60;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const n = await getNotificationById(id);
  if (!n) return { title: "Notification Not Found" };
  return { title: `${n.title} — IC IITP` };
}

export default async function NotificationDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const n = await getNotificationById(id);
  if (!n || !n.published) notFound();

  const proposalsTable: ProposalEntry[] = (n.extras?.proposalsTable ?? []) as ProposalEntry[];
  const recruitmentTable: RecruitmentEntry[] = (n.extras?.recruitmentTable ?? []) as RecruitmentEntry[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[96px] pb-12">
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        { label: "Notifications", href: "/notifications" },
        { label: n.title },
      ]} />

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {n.category && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-[--color-brand-100] text-[--color-brand-800]">
              {n.category}
            </span>
          )}
          {n.customBadge && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-orange-100 text-orange-800">
              {n.customBadge}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black text-[--color-brand-800] mb-4">{n.title}</h1>

        <div className="flex flex-wrap gap-4 text-sm text-[--color-text-subtle]">
          {n.validFrom && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              From {fmtDate(n.validFrom)}
            </span>
          )}
          {n.deadline && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              Deadline: {fmtDate(n.deadline)}
            </span>
          )}
        </div>
      </header>

      {n.coverImageUrl && (
        <div className="relative mb-8 rounded-2xl overflow-hidden border border-[--color-border]" style={{ height: "18rem" }}>
          <Image src={n.coverImageUrl} alt={n.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" />
        </div>
      )}

      <div className="prose prose-sm max-w-none mb-8 text-[--color-text]">
        <p className="text-base leading-relaxed whitespace-pre-line">{n.body}</p>
      </div>

      {/* Proposals table (Call for Proposals) */}
      {proposalsTable.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-[--color-text] mb-4">Open Calls</h2>
          <div className="overflow-x-auto rounded-xl border border-[--color-border]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[--color-surface-alt]">
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text] w-10">S.N.</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text]">Title</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text]">Details / Form</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-border]">
                {proposalsTable.map((row) => (
                  <tr key={row.sn} className="bg-[--color-surface]">
                    <td className="px-4 py-3 text-[--color-muted] font-mono text-xs">{row.sn}</td>
                    <td className="px-4 py-3 text-[--color-text]">
                      <p>{row.title}</p>
                      {row.note && <p className="text-xs text-[--color-muted] mt-1 italic">{row.note}</p>}
                      {row.moreDetailsUrl && (
                        <a href={row.moreDetailsUrl} className="text-xs text-[--color-primary] hover:underline mt-1 inline-block">
                          More Details →
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={row.detailsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[--color-surface-alt] text-[--color-text] hover:bg-[--color-brand-100] transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                          Details / PDF
                        </a>
                        {row.applicationFormUrl && (
                          <a
                            href={row.applicationFormUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[--color-brand-100] text-[--color-brand-800] hover:bg-[--color-brand-200] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                            Application Form
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recruitment table (Careers) */}
      {recruitmentTable.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-[--color-text] mb-4">Recruitment Notices</h2>
          <div className="overflow-x-auto rounded-xl border border-[--color-border]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[--color-surface-alt]">
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text] w-10">S.N.</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text]">Position</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text]">Notification Date</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text]">Deadline</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text]">Status</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-[--color-text]">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[--color-border]">
                {recruitmentTable.map((row) => (
                  <tr key={row.sn} className="bg-[--color-surface]">
                    <td className="px-4 py-3 text-[--color-muted] font-mono text-xs">{row.sn}</td>
                    <td className="px-4 py-3 text-[--color-text]">{row.position}</td>
                    <td className="px-4 py-3 text-[--color-text-subtle] text-xs">{row.notificationDate ?? "—"}</td>
                    <td className="px-4 py-3 text-[--color-text-subtle] text-xs">{row.deadline ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                        row.status === "open"
                          ? "bg-green-100 text-green-800"
                          : row.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.documents.map((doc, i) => (
                          <a
                            key={i}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md bg-[--color-surface-alt] text-[--color-text] hover:bg-[--color-brand-100] transition-colors"
                          >
                            <FileText className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {doc.label}
                          </a>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {(n.attachments?.length || n.attachmentUrl) && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-text-subtle] mb-3">Attachments</h2>
          <div className="space-y-2">
            {n.attachments?.map((att, i) => (
              <a
                key={i}
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[--color-border] hover:border-[--color-brand-300] hover:bg-[--color-brand-50] transition-all"
              >
                <FileText className="w-5 h-5 text-[--color-brand-600] shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-[--color-text]">{att.title || att.url}</span>
              </a>
            ))}
            {n.attachmentUrl && !n.attachments?.length && (
              <a
                href={n.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[--color-border] hover:border-[--color-brand-300] hover:bg-[--color-brand-50] transition-all"
              >
                <FileText className="w-5 h-5 text-[--color-brand-600] shrink-0" aria-hidden="true" />
                <span className="text-sm font-medium text-[--color-text]">Download Attachment</span>
              </a>
            )}
          </div>
        </section>
      )}

      {n.externalUrl && (
        <section className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[--color-text-subtle] mb-3">External Portal</h2>
          <ExternalLink
            href={n.externalUrl}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90"
            style={{ backgroundColor: "var(--color-brand-800)" }}
          >
            <ExternalLinkIcon className="w-4 h-4" aria-hidden="true" />
            Visit Portal
          </ExternalLink>
        </section>
      )}

      {n.contactEmail && (
        <p className="text-sm text-[--color-text-subtle]">
          Contact:{" "}
          <a href={`mailto:${n.contactEmail}`} className="text-[--color-primary] hover:underline inline-flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            {n.contactEmail}
          </a>
        </p>
      )}
    </div>
  );
}
