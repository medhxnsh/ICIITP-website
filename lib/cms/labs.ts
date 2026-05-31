import "server-only";
import { apiFetch } from "@/lib/api-client";

export interface CmsLab {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  updatedAt: string | null;
}

export interface UpdateLabRequest {
  title?: string;
  tagline?: string;
  description?: string;
}

export async function getAllLabs(): Promise<CmsLab[]> {
  return apiFetch<CmsLab[]>("/labs", { skipAuth: true, revalidate: 300 });
}

export async function getLabBySlug(slug: string): Promise<CmsLab> {
  return apiFetch<CmsLab>(`/labs/${slug}`, { skipAuth: true, revalidate: 300 });
}

export async function updateLab(slug: string, data: UpdateLabRequest): Promise<CmsLab> {
  return apiFetch<CmsLab>(`/labs/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
