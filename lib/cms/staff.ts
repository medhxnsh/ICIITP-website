import "server-only";
import { apiFetch } from "@/lib/api-client";

export interface CmsStaffMember {
  id: string;
  sectionId: string;
  sectionName: string;
  name: string;
  designation: string | null;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  linkedin: string | null;
  otherLinkUrl: string | null;
  otherLinkLabel: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CmsStaffSection {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  members: CmsStaffMember[];
}

export async function getStaffSections(): Promise<CmsStaffSection[]> {
  return apiFetch<CmsStaffSection[]>("/staff", { skipAuth: true, revalidate: 120, tags: ["staff"] });
}

export async function getAdminStaffSections(): Promise<CmsStaffSection[]> {
  return apiFetch<CmsStaffSection[]>("/staff", { cache: "no-store" });
}

export async function createStaffSection(data: { name: string; sortOrder?: number }): Promise<CmsStaffSection> {
  return apiFetch<CmsStaffSection>("/staff/sections", { method: "POST", body: JSON.stringify(data) });
}

export async function updateStaffSection(id: string, data: { name?: string; sortOrder?: number }): Promise<CmsStaffSection> {
  return apiFetch<CmsStaffSection>(`/staff/sections/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteStaffSection(id: string): Promise<void> {
  await apiFetch(`/staff/sections/${id}`, { method: "DELETE" });
}

export interface StaffMemberInput {
  sectionId: string;
  name: string;
  designation?: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
  linkedin?: string;
  otherLinkUrl?: string;
  otherLinkLabel?: string;
  sortOrder?: number;
}

export async function createStaffMember(data: StaffMemberInput): Promise<CmsStaffMember> {
  return apiFetch<CmsStaffMember>("/staff/members", { method: "POST", body: JSON.stringify(data) });
}

export async function updateStaffMember(id: string, data: Partial<StaffMemberInput>): Promise<CmsStaffMember> {
  return apiFetch<CmsStaffMember>(`/staff/members/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteStaffMember(id: string): Promise<void> {
  await apiFetch(`/staff/members/${id}`, { method: "DELETE" });
}
