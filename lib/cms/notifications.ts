import "server-only";
import { apiFetch } from "@/lib/api-client";

export type { NotificationType } from "./notification-constants";
export { TYPE_PATHS } from "./notification-constants";
import type { NotificationType } from "./notification-constants";

export const TYPE_LABELS: Record<NotificationType, string> = {
  careers:  "Careers",
  tender:   "NIQ / Tender",
  proposal: "Call for Proposals",
  news:     "News",
};

export interface CmsAttachment {
  title: string;
  url: string;
  type: string;
}

export interface ProposalEntry {
  sn: number;
  title: string;
  note?: string;
  moreDetailsUrl?: string;
  detailsUrl: string;
  applicationFormUrl?: string;
}

export interface RecruitmentDocument {
  label: string;
  url: string;
  type: string;
}

export interface RecruitmentEntry {
  sn: number;
  position: string;
  notificationDate?: string;
  deadline?: string;
  status: "open" | "closed" | "cancelled";
  documents: RecruitmentDocument[];
}

export interface CmsNotificationExtras {
  proposalsTable?: ProposalEntry[];
  recruitmentTable?: RecruitmentEntry[];
}

export interface CmsNotification {
  slug?: string;
  title: string;
  summary?: string;
  body: string;
  category: string;
  type?: NotificationType;
  deadline: string | null;
  validFrom: string | null;
  contactEmail: string;
  externalUrl: string;
  attachmentUrl: string;
  attachments?: CmsAttachment[];
  coverImageUrl?: string;
  customBadge?: string;
  published: boolean;
  extras?: CmsNotificationExtras;
  createdAt: string;
  updatedAt: string;
}

export type CmsNotificationDoc = CmsNotification & { id: string };

export interface NotificationInput {
  slug?: string;
  title: string;
  summary?: string;
  body: string;
  category: string;
  deadline: string | null;
  validFrom: string | null;
  contactEmail: string;
  externalUrl: string;
  attachmentUrl: string;
  attachments?: CmsAttachment[];
  coverImageUrl?: string;
  customBadge?: string;
  published: boolean;
  extras?: CmsNotificationExtras;
}

export async function getNotificationsByType(type: NotificationType): Promise<CmsNotificationDoc[]> {
  const label = TYPE_LABELS[type];
  const data = await apiFetch<CmsNotificationDoc[]>(
    `/notifications?category=${encodeURIComponent(label)}`,
    { skipAuth: true, revalidate: 300, tags: ["notifications"] }
  );
  return data ?? [];
}

export async function getAllAdminNotifications(): Promise<CmsNotificationDoc[]> {
  const data = await apiFetch<{ content: CmsNotificationDoc[] }>("/notifications/all?size=200");
  return data?.content ?? [];
}

export async function getPublishedNotifications(): Promise<CmsNotificationDoc[]> {
  const data = await apiFetch<CmsNotificationDoc[]>("/notifications", { skipAuth: true, revalidate: 300, tags: ["notifications"] });
  return data ?? [];
}

export async function getNotificationById(id: string): Promise<CmsNotificationDoc | null> {
  return apiFetch<CmsNotificationDoc>(`/notifications/${id}`, { skipAuth: true, revalidate: 300, tags: ["notifications", `notification-${id}`] });
}

export async function getNotificationBySlug(slug: string): Promise<CmsNotificationDoc | null> {
  return apiFetch<CmsNotificationDoc>(`/notifications/by-slug/${encodeURIComponent(slug)}`, { skipAuth: true, revalidate: 300, tags: ["notifications", `notification-slug-${slug}`] });
}

export async function createNotification(data: NotificationInput): Promise<string> {
  const result = await apiFetch<CmsNotificationDoc>("/notifications", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result.id;
}

export async function updateNotification(id: string, data: Partial<NotificationInput>): Promise<void> {
  await apiFetch<CmsNotificationDoc>(`/notifications/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await apiFetch<void>(`/notifications/${id}`, { method: "DELETE" });
}
