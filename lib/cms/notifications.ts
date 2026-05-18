/**
 * CMS data layer for notifications (careers, tenders, call-for-proposals).
 * Matches by category OR legacy type field to avoid a composite Firestore index.
 */
import { getDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "./collections";

const COL = COLLECTIONS.notifications;

export type { NotificationType } from "./notification-constants";
export { TYPE_PATHS } from "./notification-constants";

import type { NotificationType } from "./notification-constants";

export const TYPE_LABELS: Record<NotificationType, string> = {
  careers:  "Careers",
  tender:   "NIQ / Tender",
  proposal: "Call for Proposals",
};

export interface CmsAttachment {
  title: string;
  url: string;
  type: string; // "PDF", "DOCX", "Image", etc.
}

export interface CmsNotification {
  title: string;
  body: string;
  category: string;
  /** @deprecated use category */
  type?: NotificationType;
  deadline: Timestamp | null;
  validFrom: Timestamp | null;
  contactEmail: string;
  externalUrl: string;
  /** @deprecated use attachments[] */
  attachmentUrl: string;
  attachments?: CmsAttachment[];
  coverImageUrl?: string;
  customBadge?: string;
  published: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type CmsNotificationDoc = CmsNotification & { id: string };

/**
 * Returns published CMS notifications that should appear on a specific static
 * notification type-page (careers / tender / proposal). The admin form writes
 * `category` (free text), while legacy docs use `type`. We match both:
 *   - exact `type` (legacy)
 *   - `category` against TYPE_LABELS[type] (case-insensitive, prefix match)
 *
 * Done in memory rather than two Firestore queries (avoids composite index).
 */
export async function getNotificationsByType(
  type: NotificationType
): Promise<CmsNotificationDoc[]> {
  const snap = await getDb()
    .collection(COL)
    .where("published", "==", true)
    .get();
  const wantedLabel = TYPE_LABELS[type].toLowerCase();
  return snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as CmsNotification) }))
    .filter((n) => {
      if (n.type === type) return true;
      const cat = (n.category ?? "").toLowerCase();
      if (!cat) return false;
      // proposal → "call for proposals" → match "call for"; tender → "niq" or "tender"
      return cat.includes(wantedLabel) || wantedLabel.includes(cat);
    })
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function getAllAdminNotifications(): Promise<CmsNotificationDoc[]> {
  const snap = await getDb().collection(COL).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CmsNotification) }));
}

export async function getPublishedNotifications(): Promise<CmsNotificationDoc[]> {
  const snap = await getDb().collection(COL).where("published", "==", true).get();
  const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as CmsNotification) }));
  return docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export async function getNotificationById(id: string): Promise<CmsNotificationDoc | null> {
  const doc = await getDb().collection(COL).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as CmsNotification) };
}

export interface NotificationInput {
  title: string;
  body: string;
  category: string;
  deadline: Timestamp | null;
  validFrom: Timestamp | null;
  contactEmail: string;
  externalUrl: string;
  attachmentUrl: string;
  attachments?: CmsAttachment[];
  coverImageUrl?: string;
  customBadge?: string;
  published: boolean;
}

export async function createNotification(data: NotificationInput): Promise<string> {
  const ref = await getDb().collection(COL).add({
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateNotification(
  id: string,
  data: Partial<NotificationInput>
): Promise<void> {
  await getDb().collection(COL).doc(id).update({
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await getDb().collection(COL).doc(id).delete();
}
