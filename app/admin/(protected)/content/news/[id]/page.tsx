import { requireAuth } from "@/lib/auth";
import { getNewsById } from "@/lib/cms/news";
import { NewsForm } from "@/components/admin/news-form";
import { updateNewsAction } from "../actions";
import { notFound } from "next/navigation";
import { Newspaper } from "lucide-react";
import Link from "next/link";
import type { NewsFormData } from "../actions";

export const metadata = { title: "Edit Article — IC IITP Admin" };
export const dynamic = "force-dynamic";

interface Props { params: Promise<{ id: string }> }

export default async function EditNewsPage({ params }: Props) {
  await requireAuth();
  const { id } = await params;
  const raw = await getNewsById(id);
  if (!raw) notFound();

  const news: NewsFormData = {
    slug: raw.slug,
    title: raw.title,
    tagline: raw.tagline,
    body: raw.body,
    category: raw.category,
    coverImageUrl: raw.coverImageUrl,
    images: raw.images ?? [],
    imageLayout: raw.imageLayout ?? "grid",
    published: raw.published,
    featured: raw.featured,
    publishedAt: raw.publishedAt,
  };

  async function save(data: NewsFormData) {
    "use server";
    return updateNewsAction(id, data);
  }

  return (
    <main className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/content/news" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← News
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Newspaper className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black truncate" style={{ color: "var(--color-brand-950)" }}>{raw.title}</h1>
      </div>
      <NewsForm news={news} onSave={save} />
    </main>
  );
}
