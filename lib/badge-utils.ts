/**
 * Shared badge resolution for events, programs, and notifications.
 * Auto-computes date-sensitive badges; custom badges are shown additively.
 */

export type BadgeVariant = "green" | "blue" | "gray" | "orange" | "red" | "purple";

export interface BadgeInfo {
  label: string;
  variant: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { backgroundColor: string; color: string }> = {
  green:  { backgroundColor: "#dcfce7", color: "#166534" },
  blue:   { backgroundColor: "#dbeafe", color: "#1e40af" },
  gray:   { backgroundColor: "#f3f4f6", color: "#4b5563" },
  orange: { backgroundColor: "#ffedd5", color: "#9a3412" },
  red:    { backgroundColor: "#fee2e2", color: "#991b1b" },
  purple: { backgroundColor: "#ede9fe", color: "#6d28d9" },
};

export function badgeStyle(variant: BadgeVariant) {
  return VARIANT_STYLES[variant];
}

/** Extracts milliseconds from a Firestore Timestamp-like object or ISO string. */
function toMs(ts: unknown): number | null {
  if (!ts) return null;
  if (typeof ts === "string") { const d = new Date(ts); return isNaN(d.getTime()) ? null : d.getTime(); }
  if (typeof ts === "object" && ts !== null) {
    if ("seconds" in ts) return (ts as { seconds: number }).seconds * 1000;
    if ("_seconds" in ts) return (ts as { _seconds: number })._seconds * 1000;
    if ("toDate" in ts) return (ts as { toDate: () => Date }).toDate().getTime();
  }
  return null;
}

/**
 * Auto-computes a date-sensitive badge.
 * Returns null when no date info is available.
 */
export function autoDateBadge(opts: {
  deadline?: unknown;
  validFrom?: unknown;
  labelClosed?: string;
}): BadgeInfo | null {
  const now = Date.now();
  const vf = toMs(opts.validFrom);
  const dl = toMs(opts.deadline);

  if (vf && vf > now) return { label: "Upcoming", variant: "blue" };
  if (dl) {
    if (dl < now) return { label: opts.labelClosed ?? "Closed", variant: "gray" };
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (dl - now < sevenDays) return { label: "Closing Soon", variant: "orange" };
    return { label: "Active", variant: "green" };
  }
  if (vf && vf <= now) return { label: "Active", variant: "green" };
  return null;
}

/** Resolves the manual status badge for events. */
export function eventStatusBadge(status: string): BadgeInfo {
  const map: Record<string, BadgeInfo> = {
    Upcoming:  { label: "Upcoming",  variant: "blue"   },
    Ongoing:   { label: "Ongoing",   variant: "green"  },
    Closed:    { label: "Closed",    variant: "gray"   },
    Recurring: { label: "Recurring", variant: "purple" },
  };
  return map[status] ?? { label: status, variant: "gray" };
}

/** Resolves the manual status badge for programs. */
export function programStatusBadge(status: string): BadgeInfo {
  const lc = status.toLowerCase();
  if (lc === "open" || lc === "accepting applications") return { label: status, variant: "green" };
  if (lc === "closed" || lc === "applications closed") return { label: status, variant: "gray" };
  return { label: status, variant: "blue" };
}
