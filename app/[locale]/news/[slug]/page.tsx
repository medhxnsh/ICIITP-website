import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getNewsBySlug } from "@/lib/cms/news";
import { fmtDate } from "@/lib/format";
import { Breadcrumb } from "@/components/breadcrumb";
import { Calendar, Newspaper, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

interface Props { params: Promise<{ locale: string; slug: string }> }

const CATEGORY_COLOR: Record<string, string> = {
  Achievement: "var(--color-brand-800)",
  Award:       "#854d0e",
  Press:       "#1d4ed8",
  Research:    "#6d28d9",
  Partnership: "#c2410c",
  Other:       "#475569",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug).catch(() => null);
  if (!article) return {};
  return {
    title: `${article.title} — IC IITP`,
    description: article.tagline || undefined,
    openGraph: article.coverImageUrl ? { images: [{ url: article.coverImageUrl }] } : undefined,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const article = await getNewsBySlug(slug).catch(() => null);
  if (!article) notFound();

  const catColor = CATEGORY_COLOR[article.category] ?? CATEGORY_COLOR.Other;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* ── Hero ── */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(160deg, var(--color-hero-from) 0%, var(--color-hero-via) 60%, var(--color-hero-to) 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff07 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none" aria-hidden="true"
          style={{ background: "radial-gradient(circle, #f7942020 0%, transparent 65%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 relative z-10">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "News", href: "/news" },
              { label: article.title },
            ]}
            variant="light"
          />
          <Reveal>
            <div className="flex items-center gap-2 mb-5">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
              >
                {article.category}
              </span>
              {article.publishedAt && (
                <span className="flex items-center gap-1.5 text-xs text-orange-200">
                  <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                  {fmtDate(article.publishedAt)}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 max-w-3xl">
              {article.title}
            </h1>
            {article.tagline && (
              <p className="text-white/80 text-lg max-w-2xl">{article.tagline}</p>
            )}
          </Reveal>
        </div>
      </div>

      {/* ── Cover image ── */}
      {article.coverImageUrl && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
          <div className="rounded-2xl overflow-hidden isolate shadow-2xl" style={{ aspectRatio: "16/7" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${article.coverImageUrl ? "" : "pt-12"} pb-12`}>
        <div className="grid lg:grid-cols-[1fr_300px] gap-12">
          {/* Body */}
          <article className="min-w-0">
            {article.body ? (
              <p className="text-base leading-relaxed text-gray-700 break-words whitespace-pre-line">
                {article.body}
              </p>
            ) : (
              <p className="text-gray-400 italic">No content yet.</p>
            )}
          </article>

          {/* Sidebar */}
          <aside>
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl p-5" style={{ backgroundColor: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-text-secondary)" }}>About this story</p>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-placeholder)" }}>Category</dt>
                    <dd className="font-semibold" style={{ color: catColor }}>{article.category}</dd>
                  </div>
                  {article.publishedAt && (
                    <div>
                      <dt className="text-xs font-semibold mb-0.5" style={{ color: "var(--color-placeholder)" }}>Published</dt>
                      <dd style={{ color: "var(--color-text-body)" }}>{fmtDate(article.publishedAt)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <Link
                href="/news"
                className="flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-3 transition-colors hover:bg-[--color-surface-tint]"
                style={{ color: "var(--color-brand-800)" }}
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                Back to News
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ── Gallery — full width, matches cover image ── */}
      {article.images && article.images.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--color-brand-600)" }}>Gallery</p>

          {article.imageLayout === "banner" && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden isolate" style={{ aspectRatio: "16/7" }}>
                <Image src={article.images[0].url} alt={article.images[0].alt || "Photo 1"} fill className="object-cover rounded-2xl" sizes="(max-width: 768px) 100vw, 1280px" />
              </div>
              {article.images.length > 1 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {article.images.slice(1).map((img, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden isolate" style={{ aspectRatio: "4/3" }}>
                      <Image src={img.url} alt={img.alt || `Photo ${i + 2}`} fill className="object-cover rounded-xl hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {(article.imageLayout === "grid" || !article.imageLayout) && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.images.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden isolate" style={{ aspectRatio: "4/3" }}>
                  <Image src={img.url} alt={img.alt || `Photo ${i + 1}`} fill className="object-cover rounded-xl hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                </div>
              ))}
            </div>
          )}

          {article.imageLayout === "carousel" && (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory" style={{ scrollbarWidth: "thin" }}>
              {article.images.map((img, i) => (
                <div key={i} className="relative shrink-0 rounded-xl overflow-hidden isolate snap-start" style={{ width: "72%", aspectRatio: "16/7" }}>
                  <Image src={img.url} alt={img.alt || `Photo ${i + 1}`} fill className="object-cover rounded-xl" sizes="72vw" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
