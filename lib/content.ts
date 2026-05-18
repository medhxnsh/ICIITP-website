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

function readJson<T>(locale: string, ...segments: string[]): T {
  const hiPath = path.join(CONTENT_DIR, locale, ...segments);
  const enPath = path.join(CONTENT_DIR, "en", ...segments);
  const filePath = locale !== "en" && fs.existsSync(hiPath) ? hiPath : enPath;
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
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

// ── Programs ──────────────────────────────────────────────────────────────

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

export interface Program {
  slug: string;
  title: string;
  badge: string;
  tagline: string;
  lastUpdated: string;
  funder: string;
  status?: string;
  statusNote?: string;
  grant?: string;
  schemeOutlay?: string;
  stipend?: string;
  duration?: string;
  area?: string;
  applyUrl?: string;
  equipmentFormUrl?: string;
  applyForm?: string;
  applicationForm?: string;
  contactEmail?: string;
  sectors?: string[];
  domains?: string[];
  focusAreas?: string[];
  eligibility?: string[];
  notEligible?: string[];
  preferences?: string[];
  objectives?: string[];
  targetAudience?: string[];
  expectedOutcomes?: string[];
  whatWeTake?: WhatWeTakeItem[];
  termsNote?: string;
  process?: ProgramStep[];
  support?: string[];
  funding?: FundingDetail[];
  fundingVerticals?: FundingDetail[];
  applyLinks?: ApplyLink[];
  facilities?: string[];
  notes?: string[];
  disclaimer?: string[];
  about: string;
}

const PROGRAM_SLUGS = ["icitp-incubation","nidhi-prayas","nidhi-eir","sisf","bionest","genesis"] as const;
export type ProgramSlug = (typeof PROGRAM_SLUGS)[number];

export const getAllPrograms = (locale = "en") => PROGRAM_SLUGS.map((s) => getProgram(s, locale));
export const getProgram = (slug: string, locale = "en") => readJson<Program>(locale, "programs", `${slug}.json`);
export const getProgramSlugs = (): string[] => [...PROGRAM_SLUGS];

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

export const getAllLabs = (locale = "en") => LAB_SLUGS.map((s) => getLab(s, locale));
export const getLab = (slug: string, locale = "en") => readJson<Lab>(locale, "labs", `${slug}.json`);
export const getLabSlugs = (): string[] => [...LAB_SLUGS];

// ── Events ────────────────────────────────────────────────────────────────

export interface EventFee {
  category: string;
  amount: string;
}

export interface EventSpeaker {
  name: string;
  affiliation: string;
}

export interface EventContact {
  phone?: string;
  email?: string;
}

export interface EventDownload {
  title: string;
  path: string;
  format: string;
}

export interface Event {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  lastUpdated: string;
  category: string;
  validFrom: string;
  validTo: string;
  status: string;
  organiser: string;
  description: string;
  startDate?: string;
  duration?: string;
  schedule?: string;
  mode?: string;
  venue?: string;
  submissionDeadline?: string;
  pitchDate?: string;
  applyUrl?: string;
  contact?: EventContact | string;
  fees?: EventFee[];
  speakers?: EventSpeaker[];
  topics?: string[];
  themes?: string[];
  prizes?: { position: string; prize: string }[];
  specialAward?: string;
  targetAudience?: string[];
  highlights?: string[];
}

const EVENT_SLUGS = ["medtech-school","ideathon","edpi-2025","training-program"] as const;
export type EventSlug = (typeof EVENT_SLUGS)[number];

export const getAllEvents = (locale = "en") => EVENT_SLUGS.map((s) => getEvent(s, locale));
export const getEvent = (slug: string, locale = "en") => readJson<Event>(locale, "events", `${slug}.json`);
export const getEventSlugs = (): string[] => [...EVENT_SLUGS];

export function isEventArchived(event: Event): boolean {
  return new Date(event.validTo) < new Date();
}

export function getActiveEvents(locale = "en"): Event[] {
  return getAllEvents(locale).filter((e) => !isEventArchived(e));
}

export function getArchivedEvents(locale = "en"): Event[] {
  return getAllEvents(locale).filter((e) => isEventArchived(e));
}

// ── Notifications ─────────────────────────────────────────────────────────

export interface NotificationDownload {
  title: string;
  path: string;
  format: string;
}

export interface RecruitmentDocument {
  label: string;
  url: string;
  type: string; // "PDF" | "DOCX" | "Link" etc.
}

export interface RecruitmentEntry {
  sn: number;
  position: string;
  notificationDate?: string;
  deadline?: string;
  status: "open" | "closed" | "cancelled";
  documents: RecruitmentDocument[];
}

export interface ProposalEntry {
  sn: number;
  title: string;
  note?: string;
  moreDetailsUrl?: string;
  detailsUrl: string;
  applicationFormUrl?: string;
}

export interface Notification {
  slug: string;
  title: string;
  language: string;
  purpose: string;
  validFrom: string;
  validTo: string;
  category: string;
  summary: string;
  body: string;
  contactEmail?: string;
  externalUrl?: string;
  downloads?: NotificationDownload[];
  pastRoles?: string[];
  recruitmentTable?: RecruitmentEntry[];
  proposalsTable?: ProposalEntry[];
}

const NOTIFICATION_SLUGS = ["careers","call-for-proposals","niq-tender"] as const;
export type NotificationSlug = (typeof NOTIFICATION_SLUGS)[number];

export const getAllNotifications = (locale = "en") => NOTIFICATION_SLUGS.map((s) => getNotification(s, locale));
export const getNotification = (slug: string, locale = "en") => readJson<Notification>(locale, "notifications", `${slug}.json`);
export const getNotificationSlugs = (): string[] => [...NOTIFICATION_SLUGS];

export function isNotificationActive(n: Notification): boolean {
  const now = new Date();
  return new Date(n.validFrom) <= now && now <= new Date(n.validTo);
}

// ── Downloads ─────────────────────────────────────────────────────────────

export function getAllDownloads(): Download[] {
  return [
    { title: "Nidhi Prayas 2025 Application Form", path: "/pdfs/Appliation-Form-Nidhi-Prayas-2025with_Annexure.pdf", format: "PDF", purpose: "Application for Nidhi Prayas 2025 grant programme", category: "Applications", lastUpdated: "2025-09-01" },
    { title: "BioNEST Call-2 Application Form", path: "/pdfs/BIRAC-BiONEST-2.pdf", format: "PDF", purpose: "Application for BioNEST incubation Call for Proposals 2", category: "Applications", lastUpdated: "2025-05-01" },
    { title: "Nidhi-EIR Application Form", path: "/pdfs/ICIITP-Nidhi-EIR-Application1-1.pdf", format: "PDF", purpose: "Application for Nidhi Entrepreneurship-in-Residence fellowship", category: "Applications", lastUpdated: "2023-07-01" },
    { title: "IC IITP GST Certificate", path: "https://iciitp.com/wp-content/uploads/2024/03/GST-Incubation-Centre-IIT-Patna.pdf", format: "PDF", purpose: "GST registration certificate of Incubation Centre, IIT Patna", category: "Certificates", lastUpdated: "2024-03-01" },
  ];
}
