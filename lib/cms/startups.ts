import "server-only";
import { apiFetch } from "@/lib/api-client";

export type StartupScheme =
  | "nidhi-prayas" | "nidhi-eir" | "genesis-eir"
  | "meity-i" | "meity-ii" | "sisf" | "idex" | "bionest" | "startup-bihar" | "msme"
  | "business-acceleration" | "technical-acceleration";

export interface CmsStartup {
  id: string;
  name: string;
  scheme: StartupScheme | string;
  tagline?: string;
  sectors: string[];
  founders: string[];
  website?: string;
  logoUrl?: string;
  published: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllCmsStartups(scheme?: string): Promise<CmsStartup[]> {
  const params = new URLSearchParams({ size: "500" });
  if (scheme) params.set("scheme", scheme);
  const data = await apiFetch<{ content: CmsStartup[] }>(`/startups/all?${params}`);
  return data?.content ?? [];
}

export async function getPublishedStartups(scheme?: string): Promise<CmsStartup[]> {
  const q = scheme ? `?scheme=${encodeURIComponent(scheme)}` : "";
  const data = await apiFetch<CmsStartup[]>(`/startups${q}`, { skipAuth: true, revalidate: 300 });
  return data ?? [];
}

export async function getCmsStartupById(id: string): Promise<CmsStartup | null> {
  return apiFetch<CmsStartup>(`/startups/${encodeURIComponent(id)}`);
}

export async function createCmsStartup(data: Omit<CmsStartup, "id" | "createdAt" | "updatedAt">): Promise<CmsStartup> {
  return apiFetch<CmsStartup>("/startups", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCmsStartup(id: string, data: Partial<CmsStartup>): Promise<CmsStartup> {
  return apiFetch<CmsStartup>(`/startups/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteCmsStartup(id: string): Promise<void> {
  await apiFetch<void>(`/startups/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function bulkImportStartups(rows: Partial<CmsStartup>[]): Promise<{ created: number; skipped: number }> {
  return apiFetch("/startups/bulk", { method: "POST", body: JSON.stringify(rows) });
}
