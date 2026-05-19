/**
 * WordPress-backed notifications — mirrors the Firebase CmsNotificationDoc interface.
 */
import { wpFetch, acfStr, stripHtml } from "@/lib/wordpress";
import type { NotificationType } from "./notification-constants";

export interface WpNotificationDoc {
  id: string;
  title: string;
  body: string;
  category: string;              // mirrors CmsNotificationDoc.category
  notification_type: NotificationType;
  deadline: string | null;       // ISO date string or null
  validFrom: string | null;
  contactEmail: string;
  externalUrl: string;
  attachmentUrl: string;
  attachments?: never[];
  customBadge?: string;
  published: boolean;
  createdAt: string | null;      // ISO string — mirrors CmsNotificationDoc.createdAt shape for tsToMs
  updatedAt: string | null;
}

function toDoc(post: Awaited<ReturnType<typeof wpFetch>>[number]): WpNotificationDoc {
  const acf = post.acf;
  const type = acfStr(acf, "notification_type") as NotificationType;
  const typeLabels: Record<string, string> = { careers: "Careers", proposal: "Call for Proposals", tender: "NIQ / Tender" };
  return {
    id:               String(post.id),
    title:            post.title.rendered,
    body:             stripHtml(post.content.rendered),
    category:         typeLabels[type] ?? type,
    notification_type: type,
    deadline:         acfStr(acf, "deadline") || null,
    validFrom:        acfStr(acf, "valid_from") || null,
    contactEmail:     acfStr(acf, "contact_email"),
    externalUrl:      acfStr(acf, "external_url"),
    attachmentUrl:    acfStr(acf, "attachment_url"),
    customBadge:      acfStr(acf, "custom_badge") || undefined,
    published:        post.status === "publish",
    createdAt:        null,
    updatedAt:        null,
  };
}

export async function getWpNotificationsByType(type: NotificationType): Promise<WpNotificationDoc[]> {
  const posts = await wpFetch("ic_notification");
  return posts.map(toDoc).filter((n) => n.notification_type === type);
}

export async function getAllWpNotifications(): Promise<WpNotificationDoc[]> {
  const posts = await wpFetch("ic_notification");
  return posts.map(toDoc);
}
