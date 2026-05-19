/**
 * WordPress-backed events — mirrors the Firebase CmsEventDoc interface.
 */
import { wpFetch, wpFetchOne, acfStr, stripHtml } from "@/lib/wordpress";

export interface WpEventDoc {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  status: string;
  validFrom: string;
  validTo: string;
  mode: string;
  venue: string;
  applyUrl: string;
  submissionDeadline: string;
  contactEmail: string;
  contactPhone: string;
  customBadge?: string;
  published: boolean;
}

function toDoc(post: Awaited<ReturnType<typeof wpFetch>>[number]): WpEventDoc {
  const acf = post.acf;
  return {
    id:                 String(post.id),
    slug:               acfStr(acf, "slug") || post.slug,
    title:              post.title.rendered,
    tagline:            acfStr(acf, "tagline"),
    description:        stripHtml(post.content.rendered),
    category:           acfStr(acf, "category"),
    status:             acfStr(acf, "status"),
    validFrom:          acfStr(acf, "valid_from"),
    validTo:            acfStr(acf, "valid_to"),
    mode:               acfStr(acf, "mode"),
    venue:              acfStr(acf, "venue"),
    applyUrl:           acfStr(acf, "apply_url"),
    submissionDeadline: acfStr(acf, "submission_deadline"),
    contactEmail:       acfStr(acf, "contact_email"),
    contactPhone:       acfStr(acf, "contact_phone"),
    customBadge:        acfStr(acf, "custom_badge") || undefined,
    published:          post.status === "publish",
  };
}

export async function getWpPublishedEvents(): Promise<WpEventDoc[]> {
  const posts = await wpFetch("ic_event");
  return posts.map(toDoc);
}

export async function getWpEventBySlug(slug: string): Promise<WpEventDoc | null> {
  // Try by ACF slug first (our slug field), fall back to WP slug
  const posts = await wpFetch("ic_event");
  const match = posts.find((p) => (acfStr(p.acf, "slug") || p.slug) === slug);
  if (match) return toDoc(match);
  const post = await wpFetchOne("ic_event", slug);
  return post ? toDoc(post) : null;
}

export function isWpEventArchived(event: WpEventDoc): boolean {
  if (!event.validTo) return false;
  return new Date(event.validTo) < new Date();
}
