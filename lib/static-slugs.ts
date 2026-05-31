/**
 * Slugs for content backed by static JSON files in content/en/.
 * Import from here instead of defining local Sets in page files.
 */

export const STATIC_EVENT_SLUGS = [
  "medtech-school", "edpi-2025", "ideathon", "training-program",
] as const;

export const STATIC_NOTIFICATION_SLUGS = [
  "careers", "call-for-proposals", "niq-tender",
] as const;

export type StaticEventSlug = (typeof STATIC_EVENT_SLUGS)[number];
export type StaticNotificationSlug = (typeof STATIC_NOTIFICATION_SLUGS)[number];
