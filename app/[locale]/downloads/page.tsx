import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPublishedDownloads } from "@/lib/cms/downloads";
import { DownloadRow } from "@/components/download-row";
import { Breadcrumb } from "@/components/breadcrumb";
import { FileDown } from "lucide-react";
import type { Download } from "@/lib/content-types";

export const revalidate = 60;

interface Props { params: Promise<{ locale: string }> }

export const metadata: Metadata = {
  title: "Downloads",
  description: "All documents, forms, certificates, and PDFs available for download from IC IITP.",
};

export default async function DownloadsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  let allDownloads: Download[] = [];
  try {
    const raw = await getPublishedDownloads();
    allDownloads = raw.map((d) => ({
      title: d.title,
      path: d.fileUrl,
      format: d.fileType,
      purpose: d.purpose,
      category: d.category,
      lastUpdated: "",
    }));
  } catch {}

  const byCategory = allDownloads.reduce<Record<string, Download[]>>((acc, d) => {
    (acc[d.category] ??= []).push(d);
    return acc;
  }, {});

  return (
    <>
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Downloads" }]} variant="light" />
          <p className="text-xs font-semibold uppercase tracking-widest mb-4 mt-6 text-orange-200">
            <FileDown className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
            IC IITP Resources
          </p>
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">Downloads</h1>
          <p className="text-white/80 text-lg max-w-lg">All application forms, certificates, and documents available from IC IITP in one place.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {allDownloads.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            No downloads available yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-10">
            {Object.entries(byCategory).map(([category, items]) => (
              <section key={category} aria-labelledby={`cat-${category}`}>
                <h2
                  id={`cat-${category}`}
                  className="text-sm font-semibold text-[--color-muted] uppercase tracking-wider mb-4"
                >
                  {category}
                </h2>
                <div className="space-y-3">
                  {items.map((d) => (
                    <DownloadRow key={d.title} download={d} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
