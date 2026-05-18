"use server";

import { requireAuth } from "@/lib/auth";
import {
  createNotification,
  updateNotification,
  deleteNotification,
  type NotificationInput,
} from "@/lib/cms/notifications";
import { revalidatePath } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";

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
}

function toInput(data: NotificationFormData): NotificationInput {
  return {
    ...data,
    deadline: data.deadline ? Timestamp.fromDate(new Date(data.deadline)) : null,
    validFrom: data.validFrom ? Timestamp.fromDate(new Date(data.validFrom)) : null,
    attachments: data.attachments.length ? data.attachments : [],
    coverImageUrl: data.coverImageUrl || "",
  };
}

function revalidateAll() {
  revalidatePath("/notifications");
  revalidatePath("/admin/content/notifications");
}

export async function createNotificationAction(
  data: NotificationFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await createNotification(toInput(data));
    revalidateAll();
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
    revalidateAll();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update notification." };
  }
}

export async function deleteNotificationAction(id: string): Promise<void> {
  await requireAuth();
  try {
    await deleteNotification(id);
    revalidateAll();
  } catch (err) {
    console.error("[deleteNotificationAction]", err);
    throw new Error("Failed to delete notification");
  }
}
