// Shared types and constants — no server-only imports, safe for client components

export interface CmsUser {
  id: string;
  email: string;
  role: string;
  superAdmin: boolean;
  active: boolean;
  createdBy: string | null;
  createdAt: string | null;
  permissions: string[];
}

export const ALL_PERMISSIONS = [
  { key: "applications", label: "Applications" },
  { key: "pages",        label: "Pages" },
  { key: "notifications",label: "Notifications" },
  { key: "programs",     label: "Programs" },
  { key: "events",       label: "Events" },
  { key: "news",         label: "News" },
  { key: "labs",         label: "Labs" },
  { key: "downloads",    label: "Downloads" },
  { key: "startups",     label: "Portfolio" },
  { key: "staff",        label: "Staff" },
  { key: "media",        label: "Media" },
] as const;

export type PermissionKey = (typeof ALL_PERMISSIONS)[number]["key"];
