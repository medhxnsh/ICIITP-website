/**
 * WordPress-backed programs — mirrors the Firebase CmsProgramDoc interface.
 */
import { wpFetch, acfStr, acfArr, stripHtml } from "@/lib/wordpress";

export interface WpProgramDoc {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  about: string;
  badge: string;
  funder: string;
  status: string;
  statusNote: string;
  grant: string;
  duration: string;
  stipend: string;
  applyUrl: string;
  contactEmail: string;
  applicationDeadline: string;
  customBadge?: string;
  eligibility: string[];
  sectors: string[];
  lastUpdated: string;
  published: boolean;
  // Fields present on CmsProgramDoc but not stored in WP — always undefined here
  logoUrl?: string;
  images?: never[];
  imageLayout?: "banner" | "grid" | "carousel";
}

function toDoc(post: Awaited<ReturnType<typeof wpFetch>>[number]): WpProgramDoc {
  const acf = post.acf;
  return {
    id:                  String(post.id),
    slug:                acfStr(acf, "slug") || post.slug,
    title:               post.title.rendered,
    tagline:             acfStr(acf, "tagline"),
    about:               stripHtml(post.content.rendered),
    badge:               acfStr(acf, "badge"),
    funder:              acfStr(acf, "funder"),
    status:              acfStr(acf, "status"),
    statusNote:          acfStr(acf, "status_note"),
    grant:               acfStr(acf, "grant"),
    duration:            acfStr(acf, "duration"),
    stipend:             acfStr(acf, "stipend"),
    applyUrl:            acfStr(acf, "apply_url"),
    contactEmail:        acfStr(acf, "contact_email"),
    applicationDeadline: acfStr(acf, "application_deadline"),
    customBadge:         acfStr(acf, "custom_badge") || undefined,
    eligibility:         acfArr(acf, "eligibility"),
    sectors:             acfArr(acf, "sectors"),
    lastUpdated:         acfStr(acf, "last_updated"),
    published:           post.status === "publish",
  };
}

export async function getAllWpPrograms(): Promise<WpProgramDoc[]> {
  const posts = await wpFetch("ic_program");
  return posts.map(toDoc);
}

export async function getWpProgramBySlug(slug: string): Promise<WpProgramDoc | null> {
  const posts = await wpFetch("ic_program");
  return posts.map(toDoc).find((p) => p.slug === slug) ?? null;
}
