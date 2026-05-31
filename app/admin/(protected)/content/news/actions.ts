"use server";

import { requireAuth } from "@/lib/auth";
import { createNews, updateNews, deleteNews, getAdminNews, type NewsInput, type NewsCategory, type NewsImageLayout } from "@/lib/cms/news";
import { revalidatePath, revalidateTag } from "next/cache";

export interface NewsFormData {
  slug: string;
  title: string;
  tagline: string;
  body: string;
  coverImageUrl: string;
  images: { url: string; alt: string }[];
  imageLayout: NewsImageLayout;
  category: NewsCategory;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
}

function toInput(data: NewsFormData): NewsInput {
  return { ...data };
}

function revalidateNews(slug?: string) {
  revalidateTag("news", "default");
  if (slug) revalidateTag(`news-${slug}`, "default");
  revalidatePath("/admin/content/news");
  revalidatePath("/news");
  revalidatePath("/");
}

export async function createNewsAction(
  data: NewsFormData
): Promise<{ success: boolean; error?: string; id?: string }> {
  await requireAuth();
  const existing = await getAdminNews();
  if (existing.some((n) => n.slug === data.slug)) {
    return { success: false, error: `Slug "${data.slug}" is already in use.` };
  }
  try {
    const created = await createNews(toInput(data));
    revalidateNews(data.slug);
    return { success: true, id: created.id };
  } catch {
    return { success: false, error: "Failed to create news article. Please try again." };
  }
}

export async function updateNewsAction(
  id: string,
  data: NewsFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await updateNews(id, toInput(data));
    revalidateNews(data.slug);
    revalidatePath(`/news/${data.slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update news article. Please try again." };
  }
}

export async function deleteNewsAction(id: string): Promise<void> {
  await requireAuth();
  try {
    await deleteNews(id);
    revalidateNews();
  } catch (err) {
    console.error("[deleteNewsAction]", err);
    throw new Error("Failed to delete news article");
  }
}
