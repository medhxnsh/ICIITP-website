/**
 * CMS data layer for incubation programs.
 * CMS programs are additive — they extend the static JSON programs in content/en/programs/.
 */
import { getDb } from "@/lib/firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { COLLECTIONS } from "./collections";

const COL = COLLECTIONS.programs;

export interface ProgramImage {
  url: string;
  alt?: string;
}

export interface CmsProgram {
  slug: string;
  published?: boolean;
  logoUrl?: string;
  images?: ProgramImage[];
  imageLayout?: "banner" | "grid" | "carousel";
  title?: string;
  tagline?: string;
  about?: string;
  status?: string;
  statusNote?: string;
  applicationDeadline?: string; // ISO date "YYYY-MM-DD" for auto-badge
  customBadge?: string;
  applyUrl?: string;
  equipmentFormUrl?: string;
  applicationFormUrl?: string;
  contactEmail?: string;
  grant?: string;
  schemeOutlay?: string;
  stipend?: string;
  duration?: string;
  eligibility?: string[];
  notEligible?: string[];
  preferences?: string[];
  objectives?: string[];
  targetAudience?: string[];
  expectedOutcomes?: string[];
  support?: string[];
  notes?: string[];
  disclaimer?: string[];
  updatedAt?: Timestamp;
}

export type CmsProgramDoc = CmsProgram & { id: string };

export async function getCmsProgramBySlug(slug: string): Promise<CmsProgramDoc | null> {
  const snap = await getDb()
    .collection(COL)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...(d.data() as CmsProgram) };
}

export async function getAllCmsPrograms(): Promise<CmsProgramDoc[]> {
  const snap = await getDb().collection(COL).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as CmsProgram) }));
}

/** Creates or updates the CMS record for a program slug. */
export async function upsertCmsProgram(
  slug: string,
  data: Omit<CmsProgram, "slug" | "updatedAt">
): Promise<void> {
  const snap = await getDb()
    .collection(COL)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  const payload = { ...data, slug, updatedAt: FieldValue.serverTimestamp() };
  if (snap.empty) {
    await getDb().collection(COL).add(payload);
  } else {
    await snap.docs[0].ref.update(payload);
  }
}

export async function deleteCmsProgram(slug: string): Promise<void> {
  const snap = await getDb()
    .collection(COL)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (!snap.empty) await snap.docs[0].ref.delete();
}
