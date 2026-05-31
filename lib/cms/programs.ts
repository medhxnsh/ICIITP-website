import "server-only";
import { apiFetch } from "@/lib/api-client";

export type ProgramSection = "PRE_INCUBATION" | "INCUBATION" | "ACCELERATION";

export interface ProgramImage {
  url: string;
  alt?: string;
}

export interface ProgramStep {
  step: number;
  title: string;
  description: string;
}

export interface FundingDetail {
  type?: string;
  name?: string;
  amount: string;
  purpose: string;
  structure?: string;
  note?: string;
}

export interface WhatWeTakeItem {
  type: string;
  terms: string[];
}

export interface ApplyLink {
  label: string;
  href: string;
  amount?: string;
}

export interface CmsProgram {
  slug: string;
  title?: string;
  section?: ProgramSection;
  published?: boolean;
  system?: boolean;
  applicationDeadline?: string;
  // Core identity
  badge?: string;
  badgeOther?: string;
  funder?: string;
  logoUrl?: string;
  // Descriptive
  tagline?: string;
  about?: string;
  status?: string;
  statusNote?: string;
  // Financial
  grant?: string;
  schemeOutlay?: string;
  stipend?: string;
  duration?: string;
  cardHighlight?: string;
  area?: string;
  // Contact / apply
  applyUrl?: string;
  applicationForm?: string;
  equipmentFormUrl?: string;
  applicationFormUrl?: string;
  contactEmail?: string;
  applyLinks?: ApplyLink[];
  // Sectors / domains
  sectors?: string[];
  domains?: string[];
  focusAreas?: string[];
  // Lists — visibility controlled by visibleSections
  eligibility?: string[];
  pilotEligibility?: string[];
  matchingEligibility?: string[];
  notEligible?: string[];
  preferences?: string[];
  objectives?: string[];
  targetAudience?: string[];
  expectedOutcomes?: string[];
  support?: string[];
  facilities?: string[];
  notes?: string[];
  disclaimer?: string[];
  // Section visibility — only sections listed here are rendered on public page.
  // Absent/empty means "show all non-empty" (backward compat for old records).
  visibleSections?: string[];
  // Structured rich content
  process?: ProgramStep[];
  fundingVerticals?: FundingDetail[];
  funding?: FundingDetail[];
  whatWeTake?: WhatWeTakeItem[];
  termsNote?: string;
  // Media
  images?: ProgramImage[];
  imageLayout?: "banner" | "grid" | "carousel";
  // Meta
  customBadge?: string;
  updatedAt?: string;
}

export type CmsProgramDoc = CmsProgram & { id: string; title: string };

export async function getCmsProgramBySlug(slug: string): Promise<CmsProgramDoc | null> {
  return apiFetch<CmsProgramDoc>(`/programs/${encodeURIComponent(slug)}`, { skipAuth: true, revalidate: 300, tags: ["programs", `program-${slug}`] });
}

export async function getAllCmsPrograms(): Promise<CmsProgramDoc[]> {
  const data = await apiFetch<{ content: CmsProgramDoc[] }>("/programs/all?size=200");
  return data?.content ?? [];
}

export async function getPublishedPrograms(): Promise<CmsProgramDoc[]> {
  const data = await apiFetch<CmsProgramDoc[]>("/programs", { skipAuth: true, revalidate: 300, tags: ["programs"] });
  return data ?? [];
}

export async function getProgramsBySection(section: ProgramSection): Promise<CmsProgramDoc[]> {
  const data = await apiFetch<CmsProgramDoc[]>(`/programs?section=${section}`, { skipAuth: true, revalidate: 300, tags: ["programs"] });
  return data ?? [];
}

export async function upsertCmsProgram(
  slug: string,
  data: Omit<CmsProgram, "slug" | "updatedAt">
): Promise<void> {
  await apiFetch<CmsProgramDoc>(`/programs/${encodeURIComponent(slug)}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, slug }),
  });
}

export async function deleteCmsProgram(slug: string): Promise<void> {
  await apiFetch<void>(`/programs/${encodeURIComponent(slug)}`, { method: "DELETE" });
}
