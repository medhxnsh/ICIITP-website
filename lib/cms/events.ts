/**
 * CMS data layer for events — Firestore CRUD + status resolution.
 * Supports both CMS-created events and static JSON event overlays.
 */
import { getDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "./collections";

const COL = COLLECTIONS.events;

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

export interface CmsEvent {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  autoClose: boolean;
  closingDate: Timestamp | null;
  coverImageUrl: string;
  images: EventImage[];
  imageLayout: ImageLayout;
  applyUrl: string;
  contact: string;
  published: boolean;
  customBadge?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  customFields: CustomField[];
}

export type CmsEventDoc = CmsEvent & { id: string };

export async function getAdminEvents(): Promise<CmsEventDoc[]> {
  const snap = await getDb().collection(COL).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CmsEvent) }));
}

export async function getPublishedEvents(): Promise<CmsEventDoc[]> {
  const snap = await getDb()
    .collection(COL)
    .where("published", "==", true)
    .get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as CmsEvent) }));
  // Sort in memory to avoid requiring a composite Firestore index
  return docs.sort((a, b) => {
    const ta = a.createdAt instanceof Timestamp ? a.createdAt.seconds : (a.createdAt as unknown as { _seconds: number })?._seconds ?? 0;
    const tb = b.createdAt instanceof Timestamp ? b.createdAt.seconds : (b.createdAt as unknown as { _seconds: number })?._seconds ?? 0;
    return tb - ta;
  });
}

export async function getEventBySlug(slug: string): Promise<CmsEventDoc | null> {
  const snap = await getDb()
    .collection(COL)
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as CmsEvent) };
}

export async function getEventById(id: string): Promise<CmsEventDoc | null> {
  const doc = await getDb().collection(COL).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as CmsEvent) };
}

export type EventInput = Omit<CmsEvent, "createdAt" | "updatedAt">;

export async function createEvent(data: EventInput): Promise<string> {
  const ref = await getDb().collection(COL).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(id: string, data: Partial<EventInput>): Promise<void> {
  await getDb().collection(COL).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteEvent(id: string): Promise<void> {
  await getDb().collection(COL).doc(id).delete();
}

// ─── Static-event overlays ───────────────────────────────────────────────────

const OV_COL = COLLECTIONS.eventOverlays;

export interface EventOverlay {
  slug: string;
  title?: string;
  tagline?: string;
  description?: string;
  status?: EventStatus;
  applyUrl?: string;
  contact?: string;
  coverImageUrl?: string;
  images?: EventImage[];
  imageLayout?: ImageLayout;
  updatedAt?: Timestamp;
}

export type EventOverlayDoc = EventOverlay & { id: string };

export async function getEventOverlay(slug: string): Promise<EventOverlayDoc | null> {
  const snap = await getDb().collection(OV_COL).where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as EventOverlay) };
}

export async function getAllEventOverlays(): Promise<EventOverlayDoc[]> {
  const snap = await getDb().collection(OV_COL).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as EventOverlay) }));
}

export async function upsertEventOverlay(
  slug: string,
  data: Omit<EventOverlay, "slug" | "updatedAt">
): Promise<void> {
  const snap = await getDb().collection(OV_COL).where("slug", "==", slug).limit(1).get();
  const payload = { ...data, slug, updatedAt: FieldValue.serverTimestamp() };
  if (snap.empty) {
    await getDb().collection(OV_COL).add(payload);
  } else {
    await snap.docs[0].ref.update(payload);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

/** Computes the effective status, honouring autoClose + closingDate. */
export function resolveStatus(
  event: Pick<CmsEvent, "status" | "autoClose" | "closingDate">
): EventStatus {
  if (event.autoClose && event.closingDate) {
    const ts = event.closingDate;
    const d =
      ts instanceof Timestamp
        ? ts.toDate()
        : new Date((ts as unknown as { _seconds: number })._seconds * 1000);
    if (d < new Date()) return "Closed";
  }
  return event.status;
}
