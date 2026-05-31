import "server-only";
import { apiFetch } from "@/lib/api-client";

export interface NewsImage {
  url: string;
  alt: string;
}

export type NewsCategory =
  | "Achievement"
  | "Award"
  | "Press"
  | "Research"
  | "Partnership"
  | "Other";

export type NewsImageLayout = "banner" | "grid" | "carousel";

export interface CmsNewsDoc {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  body: string;
  coverImageUrl: string;
  images: NewsImage[];
  imageLayout: NewsImageLayout;
  category: NewsCategory;
  published: boolean;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewsInput = Omit<CmsNewsDoc, "id" | "createdAt" | "updatedAt">;

export async function getPublishedNews(): Promise<CmsNewsDoc[]> {
  return apiFetch<CmsNewsDoc[]>("/news", { skipAuth: true, revalidate: 120, tags: ["news"] });
}

export async function getAdminNews(): Promise<CmsNewsDoc[]> {
  const data = await apiFetch<{ content: CmsNewsDoc[] }>("/news/all?size=200");
  return data?.content ?? [];
}

export async function getNewsById(id: string): Promise<CmsNewsDoc | null> {
  try {
    return await apiFetch<CmsNewsDoc>(`/news/${id}`);
  } catch {
    return null;
  }
}

export async function getNewsBySlug(slug: string): Promise<CmsNewsDoc | null> {
  try {
    return await apiFetch<CmsNewsDoc>(`/news/slug/${slug}`, { skipAuth: true, revalidate: 120, tags: ["news", `news-${slug}`] });
  } catch {
    return null;
  }
}

export async function createNews(data: NewsInput): Promise<CmsNewsDoc> {
  return apiFetch<CmsNewsDoc>("/news", { method: "POST", body: JSON.stringify(data) });
}

export async function updateNews(id: string, data: NewsInput): Promise<CmsNewsDoc> {
  return apiFetch<CmsNewsDoc>(`/news/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteNews(id: string): Promise<void> {
  await apiFetch(`/news/${id}`, { method: "DELETE" });
}
