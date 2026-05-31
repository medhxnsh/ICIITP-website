import { requireAuth } from "@/lib/auth";
import { NewsForm } from "@/components/admin/news-form";
import { createNewsAction } from "../actions";
import { Newspaper } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "New Article — IC IITP Admin" };

export default async function NewNewsPage() {
  await requireAuth();
  return (
    <main className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/content/news" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          ← News
        </Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <Newspaper className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>New Article</h1>
      </div>
      <NewsForm onSave={createNewsAction} />
    </main>
  );
}
