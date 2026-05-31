import "server-only";
import { apiFetch } from "@/lib/api-client";

export type SubmissionType =
  | "incubation"
  | "lab-access"
  | "internship"
  | "careers"
  | "feedback"
  | "contact";

export type SubmissionStatus = "pending" | "reviewing" | "accepted" | "rejected";

export interface BaseSubmission {
  id?: string;
  type: SubmissionType;
  status: SubmissionStatus;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncubationSubmission extends BaseSubmission {
  type: "incubation";
  scheme: string;
  founderName: string;
  email: string;
  phone: string;
  startupName: string;
  website?: string;
  stage: string;
  sectors: string[];
  oneLiner: string;
  problem: string;
  dpiitRegistered: "yes" | "no" | "in-progress";
}

export interface LabAccessSubmission extends BaseSubmission {
  type: "lab-access";
  name: string;
  email: string;
  phone?: string;
  affiliation: string;
  lab: string;
  purpose: string;
  preferredDates?: string;
}

export interface InternshipSubmission extends BaseSubmission {
  type: "internship";
  name: string;
  email: string;
  phone: string;
  college: string;
  degree: string;
  year: string;
  area: string;
  duration: string;
  linkedIn?: string;
  resumeNote: string;
}

export interface FeedbackSubmission extends BaseSubmission {
  type: "feedback";
  name?: string;
  email?: string;
  category: string;
  message: string;
  rating?: number;
}

export interface CareersSubmission extends BaseSubmission {
  type: "careers";
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  message?: string;
}

export interface ContactSubmission extends BaseSubmission {
  type: "contact";
  name: string;
  email: string;
  phone: string;
  purpose: string;
  message?: string;
}

export type Submission =
  | IncubationSubmission
  | LabAccessSubmission
  | InternshipSubmission
  | FeedbackSubmission
  | CareersSubmission
  | ContactSubmission;

export type NewSubmission = { type: SubmissionType; locale: string } & Record<string, unknown>;

interface ApiSubmission {
  id: string;
  type: string;
  data: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function fromApi(s: ApiSubmission): Submission & { id: string } {
  let parsed: Record<string, unknown> = {};
  try { parsed = JSON.parse(s.data); } catch { /* ignore */ }
  return {
    ...parsed,
    id: s.id,
    type: s.type as SubmissionType,
    status: s.status as SubmissionStatus,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  } as Submission & { id: string };
}

export function collectionFor(type: SubmissionType): string {
  return `submissions-${type}`;
}

export async function createSubmission(data: NewSubmission): Promise<string> {
  const result = await apiFetch<ApiSubmission>(`/submissions/${data.type}`, {
    method: "POST",
    body: JSON.stringify(data),
    skipAuth: true,
  });
  return result.id;
}

export async function getSubmissions(
  type?: SubmissionType,
  limit = 200
): Promise<(Submission & { id: string })[]> {
  const params = new URLSearchParams({ size: String(limit) });
  if (type) params.set("type", type);
  const data = await apiFetch<{ content: ApiSubmission[] }>(`/submissions?${params}`);
  return (data?.content ?? []).map(fromApi);
}

export async function updateSubmissionStatus(
  id: string,
  _type: SubmissionType,
  status: SubmissionStatus
): Promise<void> {
  await apiFetch<ApiSubmission>(`/submissions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function deleteSubmission(id: string): Promise<void> {
  await apiFetch<void>(`/submissions/${id}`, { method: "DELETE" });
}
