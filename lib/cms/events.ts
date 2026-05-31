import "server-only";
import { apiFetch } from "@/lib/api-client";

export type EventCategory = "Training" | "Competition" | "Conference" | "Workshop" | "Other";
export type EventStatus = "Upcoming" | "Ongoing" | "Closed" | "Recurring";
export type FieldType = "text" | "textarea" | "url" | "date" | "image" | "list";

export interface CustomField {
  id: string;
  label: string;
  description: string;
  type: FieldType;
  value: string;
  items: string[];
  order: number;
}

export interface EventImage {
  url: string;
  alt?: string;
}

export type ImageLayout = "banner" | "grid" | "carousel";

export interface EventFee { category: string; amount: string }
export interface EventSpeaker { name: string; affiliation: string }
export interface EventPrize { position: string; prize: string }
export interface EventAttachment { title: string; url: string; type: string }

export interface CmsEvent {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  autoClose: boolean;
  closingDate: string | null;
  coverImageUrl: string;
  images: EventImage[];
  imageLayout: ImageLayout;
  applyUrl: string;
  contact: string;
  published: boolean;
  customBadge?: string;
  createdAt: string;
  updatedAt: string;
  customFields: CustomField[];
  // Rich extras (seeded events + optional on all events)
  shortTitle?: string;
  organiser?: string;
  venue?: string;
  mode?: string;
  schedule?: string;
  duration?: string;
  contactPhone?: string;
  topics?: string[];
  highlights?: string[];
  themes?: string[];
  targetAudience?: string[];
  prizes?: EventPrize[];
  specialAward?: string;
  fees?: EventFee[];
  speakers?: EventSpeaker[];
  attachments?: EventAttachment[];
}

export type CmsEventDoc = CmsEvent & { id: string };
export type EventInput = Omit<CmsEvent, "createdAt" | "updatedAt">;


export async function getAdminEvents(): Promise<CmsEventDoc[]> {
  const data = await apiFetch<{ content: CmsEventDoc[] }>("/events/all?size=200");
  return data?.content ?? [];
}

export async function getPublishedEvents(): Promise<CmsEventDoc[]> {
  const data = await apiFetch<CmsEventDoc[]>("/events", { skipAuth: true, revalidate: 300, tags: ["events"] });
  return data ?? [];
}

export async function getEventBySlug(slug: string): Promise<CmsEventDoc | null> {
  return apiFetch<CmsEventDoc>(`/events/slug/${encodeURIComponent(slug)}`, { skipAuth: true, revalidate: 300, tags: ["events", `event-${slug}`] });
}

export async function getEventById(id: string): Promise<CmsEventDoc | null> {
  return apiFetch<CmsEventDoc>(`/events/${id}`);
}

export async function createEvent(data: EventInput): Promise<string> {
  const result = await apiFetch<CmsEventDoc>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result.id;
}

export async function updateEvent(id: string, data: Partial<EventInput>): Promise<void> {
  await apiFetch<CmsEventDoc>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await apiFetch<void>(`/events/${id}`, { method: "DELETE" });
}


export function resolveStatus(
  event: Pick<CmsEvent, "status" | "autoClose" | "closingDate">
): EventStatus {
  if (event.autoClose && event.closingDate && new Date(event.closingDate) < new Date()) {
    return "Closed";
  }
  return event.status;
}
