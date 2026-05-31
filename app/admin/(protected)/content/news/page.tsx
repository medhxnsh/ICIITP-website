import { requireAuth } from "@/lib/auth";
import { getAdminNews } from "@/lib/cms/news";
import { fmtDate } from "@/lib/format";
import { Newspaper, Plus } from "lucide-react";
import Link from "next/link";
import { DeleteNewsButton } from "./_delete-button";

export const metadata = { title: "News — IC IITP Admin" };
export const dynamic = "force-dynamic";

const CATEGORY_STYLE: Record<string, { bg: string; text: string }> = {
  Achievement: { bg: "var(--color-surface-tint)", text: "var(--color-brand-800)" },
  Award:       { bg: "#fef9c3", text: "#854d0e" },
  Press:       { bg: "#eff6ff", text: "#1d4ed8" },
  Research:    { bg: "#f5f3ff", text: "#6d28d9" },
  Partnership: { bg: "#fff7ed", text: "#c2410c" },
  Other:       { bg: "#f1f5f9", text: "#475569" },
};

export default async function NewsListPage() {
  await requireAuth();
  const rawArticles = await getAdminNews();
  let featuredSeen = false;
  const articles = rawArticles.map((a) => {
    if (a.featured && !featuredSeen) { featuredSeen = true; return a; }
    return { ...a, featured: false };
  });

  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Newspaper className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>News</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          {articles.length} total
        </span>
        <Link href="/admin/content/news/new" className="ml-auto flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--color-brand-800)" }}>
          <Plus className="w-4 h-4" /> New article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ border: "1.5px dashed #d4e6c4" }}>
          <Newspaper className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--color-input-border)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>No news articles yet.</p>
          <p className="text-xs mt-1 mb-4" style={{ color: "var(--color-placeholder)" }}>Use &ldquo;+ New article&rdquo; to publish your first story.</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: "1px solid #e8f0e0" }}>
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col style={{ width: "42%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "12%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: "var(--color-surface-card)", borderBottom: "1px solid #e8f0e0" }}>
                <th className="text-left px-5 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Article</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Category</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Visibility</th>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "var(--color-text-secondary)" }}>Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--color-surface-tint)" }}>
              {articles.map((article) => {
                const catStyle = CATEGORY_STYLE[article.category] ?? CATEGORY_STYLE.Other;
                return (
                  <tr key={article.id}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {article.coverImageUrl && (
                          <div className="shrink-0 w-10 h-8 rounded overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={article.coverImageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold leading-snug truncate" style={{ color: "var(--color-brand-950)" }}>{article.title}</p>
                            {article.featured && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa" }}>
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <p className="text-xs mt-0.5 font-mono truncate" style={{ color: "var(--color-placeholder)" }}>{article.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide" style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
                        {article.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={article.published
                          ? { backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }
                          : { backgroundColor: "#f1f5f9", color: "#64748b" }}>
                        {article.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                      {article.publishedAt ? fmtDate(article.publishedAt) : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <Link href={`/en/news/${article.slug}`} target="_blank"
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "var(--color-surface-card)", color: "var(--color-text-secondary)" }}>
                          View ↗
                        </Link>
                        <Link href={`/admin/content/news/${article.id}`}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg"
                          style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                          Edit
                        </Link>
                        <DeleteNewsButton id={article.id} title={article.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
