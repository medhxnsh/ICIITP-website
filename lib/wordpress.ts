/**
 * WordPress REST API client.
 * All public page fetches go through here. Runs server-side only.
 * ISR caching is handled at the page level via Next.js `revalidate`.
 */
import "server-only";

const WP_URL = (process.env.WORDPRESS_API_URL ?? "http://iciitp.local").replace(/\/$/, "");

// Raw WP REST API response shape
export interface WpPost {
  id: number;
  slug: string;
  status: string;
  title: { rendered: string };
  content: { rendered: string };
  acf: Record<string, unknown>;
}

/** Fetch all posts of a custom post type (handles pagination up to 100). */
export async function wpFetch(postType: string, params: Record<string, string> = {}): Promise<WpPost[]> {
  const qs = new URLSearchParams({ per_page: "100", status: "publish", ...params });
  const url = `${WP_URL}/wp-json/wp/v2/${postType}?${qs}`;
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`WP fetch ${postType} failed: ${res.status}`);
  return res.json() as Promise<WpPost[]>;
}

/** Fetch a single post by slug. Returns null if not found. */
export async function wpFetchOne(postType: string, slug: string): Promise<WpPost | null> {
  const posts = await wpFetch(postType, { slug });
  return posts[0] ?? null;
}

/** Strip HTML tags from WP rendered content. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#8217;/g, "'").replace(/&nbsp;/g, " ").trim();
}

export function acfStr(acf: Record<string, unknown>, key: string): string {
  return String(acf[key] ?? "");
}

export function acfArr(acf: Record<string, unknown>, key: string): string[] {
  const v = acf[key];
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String);
  return String(v).split(",").map((s) => s.trim()).filter(Boolean);
}
