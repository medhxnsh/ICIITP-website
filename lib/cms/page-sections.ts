import "server-only";
import { apiFetch } from "@/lib/api-client";

export interface HomeStat { value: string; label: string }

export interface HomeSection {
  about_headline: string;
  about_body_1: string;
  about_body_2: string;
  cta_headline: string;
  cta_body: string;
  building_image_url: string;
  team_staff_image_url: string;
  team_group_image_url: string;
  stats: HomeStat[];
}

export interface ContactSection {
  address: string;
  enquiries_name: string;
  enquiries_phone: string;
  incubation_name: string;
  incubation_phone: string;
  email: string;
  hours: string;
  maps_embed_url: string;
}

export interface AboutSection {
  building_image_url: string;
  inauguration_image_url: string;
  inauguration_caption: string;
  ceremony_image_url: string;
  ceremony_overlay_title: string;
  ceremony_overlay_body: string;
}

type SectionKey = "home" | "contact" | "about";
type SectionData = HomeSection | ContactSection | AboutSection;

export async function getPageSection(key: "home"): Promise<HomeSection | null>;
export async function getPageSection(key: "contact"): Promise<ContactSection | null>;
export async function getPageSection(key: "about"): Promise<AboutSection | null>;
export async function getPageSection(key: SectionKey): Promise<SectionData | null> {
  const data = await apiFetch<Record<string, unknown>>(`/pages/${key}`, { skipAuth: true, revalidate: 300, tags: [`page-section-${key}`] });
  if (!data || Object.keys(data).length === 0) return null;
  return data as unknown as SectionData;
}

export async function upsertPageSection(key: SectionKey, data: Omit<SectionData, never>): Promise<void> {
  await apiFetch<Record<string, unknown>>(`/pages/${key}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
