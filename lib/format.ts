/**
 * Shared formatting helpers for dates, timestamps, and slugs.
 * Replace per-file copies — there is no good reason to have five `fmtDate`
 * implementations across the admin pages.
 */

const DATE_FMT: Intl.DateTimeFormatOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/**
 * Best-effort milliseconds extraction from an ISO string, Date, number,
 * or serialized {_seconds, _nanoseconds} object.
 */
export function tsToMs(ts: unknown): number {
  if (!ts) return 0;
  if (ts instanceof Date) return ts.getTime();
  if (typeof ts === "number") return ts;
  if (typeof ts === "string") {
    const n = Date.parse(ts);
    return Number.isNaN(n) ? 0 : n;
  }
  if (typeof ts === "object" && ts !== null && "_seconds" in ts) {
    return (ts as { _seconds: number })._seconds * 1000;
  }
  return 0;
}

/** Formats a timestamp-like value as "12 May 2026". Returns "—" for empty values. */
export function fmtDate(ts: unknown): string {
  const ms = tsToMs(ts);
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-IN", DATE_FMT);
}

/** Formats as a short relative string ("3m ago", "2h ago", "5d ago") or absolute date. */
export function timeAgo(ts: unknown): string {
  const ms = tsToMs(ts);
  if (!ms) return "—";
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return fmtDate(ms);
}

/** Converts a string to a URL-safe lowercase-kebab slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
