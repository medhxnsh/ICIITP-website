/**
 * WordPress-backed startups.
 */
import { wpFetch, acfStr, acfArr } from "@/lib/wordpress";
import type { StartupScheme } from "@/lib/content-types";

export interface WpStartupDoc {
  id: string;
  name: string;
  scheme: StartupScheme;
  tagline: string;
  sectors: string[];
  founders: string[];
  website?: string;
  logo?: string;
}

function toDoc(post: Awaited<ReturnType<typeof wpFetch>>[number]): WpStartupDoc {
  const acf = post.acf;
  return {
    id:       String(post.id),
    name:     post.title.rendered,
    scheme:   acfStr(acf, "scheme") as StartupScheme,
    tagline:  acfStr(acf, "tagline"),
    sectors:  acfArr(acf, "sectors"),
    founders: acfArr(acf, "founders"),
    website:  acfStr(acf, "website") || undefined,
    logo:     acfStr(acf, "logo") || undefined,
  };
}

export async function getAllWpStartups(): Promise<WpStartupDoc[]> {
  const posts = await wpFetch("ic_startup");
  return posts.map(toDoc);
}

export async function getWpStartupsByScheme(scheme: StartupScheme): Promise<WpStartupDoc[]> {
  const all = await getAllWpStartups();
  return all.filter((s) => s.scheme === scheme);
}
