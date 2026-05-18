"use server";

import { requireAuth } from "@/lib/auth";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAdminEvents,
  upsertEventOverlay,
  type EventInput,
  type EventCategory,
  type EventStatus,
  type CustomField,
  type EventOverlay,
  type EventImage,
  type ImageLayout,
} from "@/lib/cms/events";
import { revalidatePath } from "next/cache";
import { Timestamp } from "firebase-admin/firestore";

export interface EventFormData {
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
  customFields: CustomField[];
}

function toInput(data: EventFormData): EventInput {
  return {
    ...data,
    closingDate: data.closingDate
      ? Timestamp.fromDate(new Date(data.closingDate))
      : null,
  };
}

function revalidateEvents() {
  revalidatePath("/admin/content/events");
  revalidatePath("/events");
}

export async function createEventAction(
  data: EventFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  // Check slug uniqueness
  const existing = await getAdminEvents();
  if (existing.some((e) => e.slug === data.slug)) {
    return { success: false, error: `Slug "${data.slug}" is already in use.` };
  }
  try {
    await createEvent(toInput(data));
    revalidateEvents();
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create event. Please try again." };
  }
}

export async function updateEventAction(
  id: string,
  data: EventFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await updateEvent(id, toInput(data));
    revalidateEvents();
    revalidatePath(`/events/${data.slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update event. Please try again." };
  }
}

export async function deleteEventAction(id: string): Promise<void> {
  await requireAuth();
  try {
    await deleteEvent(id);
    revalidateEvents();
  } catch (err) {
    console.error("[deleteEventAction]", err);
    throw new Error("Failed to delete event");
  }
}

export type EventOverlayFormData = Omit<EventOverlay, "slug" | "updatedAt">;

export async function saveEventOverlayAction(
  slug: string,
  data: EventOverlayFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await upsertEventOverlay(slug, data);
    revalidatePath("/admin/content/events");
    revalidatePath(`/events/${slug}`);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to save. Please try again." };
  }
}
