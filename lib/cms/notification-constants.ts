/**
 * Shared notification type union and path mappings.
 * Kept separate to avoid circular imports between notifications.ts and its consumers.
 */
export type NotificationType = "careers" | "tender" | "proposal" | "news";

export const TYPE_PATHS: Record<NotificationType, string> = {
  careers: "careers",
  tender: "niq-tender",
  proposal: "call-for-proposals",
  news: "news",
};
