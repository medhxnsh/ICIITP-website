"use server";

import { requireAuth } from "@/lib/auth";
import {
  createNotification,
  updateNotification,
  deleteNotification,
  type NotificationInput,
  type CmsNotificationExtras,
} from "@/lib/cms/notifications";
import { revalidatePath, revalidateTag } from "next/cache";

export interface NotificationFormData {
  title: string;
  body: string;
  category: string;
  deadline: string | null;
  validFrom: string | null;
  contactEmail: string;
  externalUrl: string;
  attachmentUrl: string;
  attachments: Array<{ title: string; url: string; type: string }>;
  coverImageUrl: string;
  customBadge?: string;
  published: boolean;
  extras?: CmsNotificationExtras;
}

function toInput(data: NotificationFormData): NotificationInput {
  return {
    ...data,
    attachments: data.attachments.length ? data.attachments : [],
    coverImageUrl: data.coverImageUrl || "",
    extras: data.extras,
  };
}

function revalidateAll(id?: string) {
  revalidateTag("notifications", "default");
  if (id) revalidateTag(`notification-${id}`, "default");
  revalidatePath("/", "layout");
  revalidatePath("/notifications", "page");
  revalidatePath("/admin/content/notifications", "page");
}

export async function createNotificationAction(
  data: NotificationFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    const id = await createNotification(toInput(data));
    revalidateAll(id);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create notification." };
  }
}

export async function updateNotificationAction(
  id: string,
  data: NotificationFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await updateNotification(id, toInput(data));
    revalidateAll(id);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update notification." };
  }
}

export async function deleteNotificationAction(id: string): Promise<void> {
  await requireAuth();
  try {
    await deleteNotification(id);
    revalidateAll(id);
  } catch (err) {
    console.error("[deleteNotificationAction]", err);
    throw new Error("Failed to delete notification");
  }
}
