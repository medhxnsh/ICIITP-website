/**
 * Static content loader — reads JSON files from content/en/ at build/request time.
 * Server-only (marked with "server-only"). Falls back gracefully when files are missing.
 */
import "server-only";
import path from "path";
import fs from "fs";
import type { StartupScheme, Startup, Download } from "./content-types";
export type { StartupScheme, Startup, Download } from "./content-types";
export { SCHEME_LABELS } from "./content-types";

const CONTENT_DIR = path.join(process.cwd(), "content");

const jsonCache = new Map<string, unknown>();

function readJson<T>(_locale: string, ...segments: string[]): T {
  const filePath = path.join(CONTENT_DIR, "en", ...segments);
  if (jsonCache.has(filePath)) return jsonCache.get(filePath) as T;
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  jsonCache.set(filePath, parsed);
  return parsed;
}

// ── Team ──────────────────────────────────────────────────────────────────

export interface TeamMember {
  name: string;
  designation: string;
  role: string;
  photo?: string;
  bio?: string;
  email?: string;
  linkedin?: string;
}

export const getGovernance = (locale = "en") => readJson<TeamMember[]>(locale, "team", "governance.json");
export const getEvaluationTeam = (locale = "en") => readJson<TeamMember[]>(locale, "team", "evaluation.json");
export const getStaff = (locale = "en") => readJson<TeamMember[]>(locale, "team", "staff.json");

// ── Startups ──────────────────────────────────────────────────────────────

export const getAllStartups = (locale = "en") => readJson<Startup[]>(locale, "startups", "index.json");

export function getStartupsByScheme(scheme: StartupScheme, locale = "en"): Startup[] {
  return getAllStartups(locale).filter((s) => s.scheme === scheme);
}

// ── Labs ──────────────────────────────────────────────────────────────────

export interface LabEquipment {
  name: string;
  purpose: string;
}

export interface Lab {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  lastUpdated: string;
  area?: string;
  class?: string;
  equipment: LabEquipment[];
}

const LAB_SLUGS = ["clean-room","pcb-fab","test-cal","mech-packaging","esdm","design-sim"] as const;
export type LabSlug = (typeof LAB_SLUGS)[number];

export const getLabSlugs = (): string[] => [...LAB_SLUGS];

/** Returns only the static/technical fields (equipment, area, class) from JSON — dev-managed. */
export const getLabEquipment = (slug: string, locale = "en") => readJson<Lab>(locale, "labs", `${slug}.json`);

// ── Downloads ─────────────────────────────────────────────────────────────

export function getAllDownloads(): Download[] {
  return [
    { title: "Nidhi Prayas 2025 Application Form", path: "/pdfs/Appliation-Form-Nidhi-Prayas-2025with_Annexure.pdf", format: "PDF", purpose: "Application for Nidhi Prayas 2025 grant programme", category: "Applications", lastUpdated: "2025-09-01" },
    { title: "BioNEST Call-2 Application Form", path: "/pdfs/BIRAC-BiONEST-2.pdf", format: "PDF", purpose: "Application for BioNEST incubation Call for Proposals 2", category: "Applications", lastUpdated: "2025-05-01" },
    { title: "Nidhi-EIR Application Form", path: "/pdfs/ICIITP-Nidhi-EIR-Application1-1.pdf", format: "PDF", purpose: "Application for Nidhi Entrepreneurship-in-Residence fellowship", category: "Applications", lastUpdated: "2023-07-01" },
    { title: "IC IITP GST Certificate", path: "https://iciitp.com/wp-content/uploads/2024/03/GST-Incubation-Centre-IIT-Patna.pdf", format: "PDF", purpose: "GST registration certificate of Incubation Centre, IIT Patna", category: "Certificates", lastUpdated: "2024-03-01" },
  ];
}
