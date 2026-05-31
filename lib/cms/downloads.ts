import "server-only";
import { apiFetch } from "@/lib/api-client";

export interface CmsDownload {
  title: string;
  fileUrl: string;
  fileType: string;
  category: string;
  purpose: string;
  published: boolean;
  displayPage?: string;
  createdAt: string;
  updatedAt: string;
}

export type CmsDownloadDoc = CmsDownload & { id: string };
export type DownloadInput = Omit<CmsDownload, "createdAt" | "updatedAt">;

export async function getPublishedDownloads(): Promise<CmsDownloadDoc[]> {
  const data = await apiFetch<CmsDownloadDoc[]>("/downloads", { revalidate: 300 });
  return data ?? [];
}

export async function getDownloadsByPage(page: string): Promise<CmsDownloadDoc[]> {
  const data = await apiFetch<CmsDownloadDoc[]>(
    `/downloads?displayPage=${encodeURIComponent(page)}`,
    { revalidate: 300 }
  );
  return data ?? [];
}

export async function getAllAdminDownloads(): Promise<CmsDownloadDoc[]> {
  const data = await apiFetch<{ content: CmsDownloadDoc[] }>("/downloads/all?size=200");
  return data?.content ?? [];
}

export async function getDownloadById(id: string): Promise<CmsDownloadDoc | null> {
  return apiFetch<CmsDownloadDoc>(`/downloads/${id}`);
}

export async function createDownload(data: DownloadInput): Promise<string> {
  const result = await apiFetch<CmsDownloadDoc>("/downloads", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result.id;
}

export async function updateDownload(id: string, data: Partial<DownloadInput>): Promise<void> {
  await apiFetch<CmsDownloadDoc>(`/downloads/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDownload(id: string): Promise<void> {
  await apiFetch<void>(`/downloads/${id}`, { method: "DELETE" });
}
