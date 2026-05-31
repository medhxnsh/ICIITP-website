import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedNews } from "@/lib/cms/news";
import { Breadcrumb } from "@/components/breadcrumb";
import { ArrowRight, Newspaper, Calendar } from "lucide-react";
import { fmtDate } from "@/lib/format";
import { Reveal, Stagger, StaggerItem } from "@/components/reveal";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "News & Achievements — IC IITP",
  description: "Latest news, updates, and achievements from IC IITP — IIT Patna's technology incubation centre.",
};

const CATEGORY_COLOR: Record<string, string> = {
  Achievement: "var(--color-brand-800)",
  Award:       "#854d0e",
  Press:       "#1d4ed8",
  Research:    "#6d28d9",
  Partnership: "#c2410c",
  Other:       "#475569",
};

interface Props { params: Promise<{ locale: string }> }

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const published = await getPublishedNews().catch(() => []);
  const featured = published.find((n) => n.featured) ?? published[0] ?? null;
  const rest = published.filter((n) => n !== featured);

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
            items={[{ label: "Home", href: "/" }, { label: "News & Achievements" }]}
            variant="light"
          />
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4 text-orange-200">
              <Newspaper className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" aria-hidden="true" />
              What&apos;s happening at IC IITP
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
              News &amp;<br />Achievements
            </h1>
            <p className="text-white/80 text-lg max-w-lg">
              Latest updates, milestones, and achievements from our incubation centre and portfolio startups.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {published.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper className="w-12 h-12 mx-auto mb-4 text-gray-300" aria-hidden="true" />
            <p className="text-gray-500 text-lg font-medium mb-2">No news yet</p>
            <p className="text-gray-400 text-sm">Check back soon for updates from IC IITP.</p>
          </div>
        ) : (
          <>
            {/* ── Featured story ── */}
            {featured && (
              <Reveal className="mb-14">
                <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--color-brand-600)" }}>Featured</p>
                <Link
                  href={`/news/${featured.slug}`}
                  className="group grid lg:grid-cols-[1fr_420px] gap-0 rounded-3xl overflow-hidden border border-gray-200 bg-white hover:shadow-2xl hover:border-green-200 transition-all duration-300"
                >
                  {/* Content */}
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-5 self-start"
                      style={{ backgroundColor: "#f7942018", color: "#c45a00" }}
                    >
                      <Newspaper className="w-3 h-3" aria-hidden="true" />
                      {featured.category}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-snug mb-4 group-hover:text-green-800 transition-colors">
                      {featured.title}
                    </h2>
                    {featured.tagline && (
                      <p className="text-gray-500 text-base leading-relaxed mb-6 line-clamp-3">
                        {featured.tagline}
                      </p>
                    )}
                    {featured.publishedAt && (
                      <p className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        {fmtDate(featured.publishedAt)}
                      </p>
                    )}
                    <span
                      className="inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl text-white self-start group-hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: "var(--color-brand-800)" }}
                    >
                      Read full story <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>

                  {/* Cover image */}
                  <div className="relative min-h-[260px] lg:min-h-0 overflow-hidden isolate rounded-b-3xl lg:rounded-l-none lg:rounded-r-3xl">
                    {featured.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featured.coverImageUrl}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center min-h-[260px]"
                        style={{ background: "linear-gradient(135deg, #3a5214, #1e3209)" }}>
                        <Newspaper className="w-16 h-16 text-white/20" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                </Link>
              </Reveal>
            )}

            {/* ── Grid ── */}
            {rest.length > 0 && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: "var(--color-brand-600)" }}>
                  More updates
                </p>
                <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((article) => {
                    const catColor = CATEGORY_COLOR[article.category] ?? CATEGORY_COLOR.Other;
                    return (
                      <StaggerItem key={article.id}>
                        <Link
                          href={`/news/${article.slug}`}
                          className="group flex flex-col rounded-2xl overflow-hidden border border-gray-200 bg-white hover:shadow-xl hover:border-green-200 hover:-translate-y-0.5 transition-all duration-300 h-full"
                        >
                          {/* Cover */}
                          <div className="relative overflow-hidden isolate shrink-0 rounded-t-2xl" style={{ aspectRatio: "16/9" }}>
                            {article.coverImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={article.coverImageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, #f2faf5, #e8f5ee)" }}>
                                <Newspaper className="w-8 h-8" style={{ color: "#3a521430" }} aria-hidden="true" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex flex-col flex-1 p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: catColor }}>
                                {article.category}
                              </span>
                              {article.publishedAt && (
                                <span className="text-[10px] text-gray-400 ml-auto">{fmtDate(article.publishedAt)}</span>
                              )}
                            </div>
                            <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-green-800 transition-colors line-clamp-2 flex-1 text-sm">
                              {article.title}
                            </h3>
                            {article.tagline && (
                              <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{article.tagline}</p>
                            )}
                            <span className="inline-flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--color-brand-800)" }}>
                              Read more <ArrowRight className="w-3 h-3" aria-hidden="true" />
                            </span>
                          </div>
                        </Link>
                      </StaggerItem>
                    );
                  })}
                </Stagger>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
