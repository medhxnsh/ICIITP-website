"use server";

import { requireAuth } from "@/lib/auth";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  type EventInput,
  type EventCategory,
  type EventStatus,
  type CustomField,
  type EventImage,
  type ImageLayout,
  type EventAttachment,
} from "@/lib/cms/events";
// getAdminEvents removed — slug uniqueness is now enforced by the DB unique constraint
import { revalidatePath, revalidateTag } from "next/cache";

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
  attachments: EventAttachment[];
}

function toInput(data: EventFormData): EventInput {
  return { ...data };
}

function revalidateEvents(slug?: string) {
  revalidateTag("events", "default");
  if (slug) revalidateTag(`event-${slug}`, "default");
  revalidatePath("/", "layout");
  revalidatePath("/events", "page");
  revalidatePath("/admin/content/events", "page");
}

export async function createEventAction(
  data: EventFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await createEvent(toInput(data));
    revalidateEvents(data.slug);
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("already in use") || msg.includes("duplicate")) {
      return { success: false, error: `Slug "${data.slug}" is already in use.` };
    }
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
    revalidateEvents(data.slug);
    revalidatePath(`/events/${data.slug}`, "page");
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

