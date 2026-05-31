import type { ProgramSection } from "@/lib/cms/programs";

export interface ProgramCategory {
  slug: string;
  sectionKey: ProgramSection;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  bgColor: string;
}

export const PROGRAM_CATEGORIES: ProgramCategory[] = [
  {
    slug: "pre-incubation",
    sectionKey: "PRE_INCUBATION",
    title: "Pre-Incubation",
    subtitle: "Idea → Prototype",
    description:
      "Early-stage support for innovators with an idea or early prototype. Grants, stipends, and mentorship to help you build your first working proof-of-concept.",
    accentColor: "#f79420",
    bgColor: "#fff8f0",
  },
  {
    slug: "incubation",
    sectionKey: "INCUBATION",
    title: "Incubation",
    subtitle: "Prototype → Market",
    description:
      "Full-stack incubation with seed funding, lab access, mentoring, and legal support to take your validated prototype to a market-ready product.",
    accentColor: "#3a5214",
    bgColor: "#f0f7e6",
  },
  {
    slug: "acceleration",
    sectionKey: "ACCELERATION",
    title: "Acceleration",
    subtitle: "Market → Scale",
    description:
      "Structured acceleration for startups with early revenue, helping them grow faster through business development, investor access, and technical scaling.",
    accentColor: "#1e3209",
    bgColor: "#e8f5ee",
  },
];

export const CATEGORY_BY_SECTION = Object.fromEntries(
  PROGRAM_CATEGORIES.map((c) => [c.sectionKey, c])
) as Record<ProgramSection, ProgramCategory>;

/** Fallback badge labels for programs that don't have one set in the DB */
export const STATIC_BADGES: Record<string, string> = {
  "nidhi-eir":    "DST NSTEDB",
  "nidhi-prayas": "DST NIDHI",
  "genesis-eir":  "MeitY",
  "genesis":      "MeitY",
  "sisf":         "SISF",
  "bionest":      "DBT BioNEST",
  "meity-i":      "MeitY",
  "meity":        "MeitY",
  "idex":         "iDEX",
};

export function getProgramBadge(slug: string, dbBadge?: string | null): string | null {
  return dbBadge || STATIC_BADGES[slug] || null;
}
