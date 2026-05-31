"use server";

import { requireAuth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  createStaffSection,
  updateStaffSection,
  deleteStaffSection,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  type StaffMemberInput,
} from "@/lib/cms/staff";

function revalidateStaff() {
  revalidatePath("/admin/content/staff");
  revalidatePath("/en/about/staff");
  revalidatePath("/about/staff");
  revalidateTag("staff", "default");
}

// ── Sections ──────────────────────────────────────────────────────────────────

export async function createSectionAction(name: string): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await createStaffSection({ name, sortOrder: 0 });
    revalidateStaff();
    return { success: true };
  } catch (e) {
    console.error("[staff] createSection failed:", e);
    return { success: false, error: String(e) };
  }
}

export async function renameSectionAction(id: string, name: string): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await updateStaffSection(id, { name });
    revalidateStaff();
    return { success: true };
  } catch (e) {
    console.error("[staff] renameSection failed:", e);
    return { success: false, error: String(e) };
  }
}

export async function deleteSectionAction(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await deleteStaffSection(id);
    revalidateStaff();
    return { success: true };
  } catch (e) {
    console.error("[staff] deleteSection failed:", e);
    return { success: false, error: String(e) };
  }
}

// ── Members ───────────────────────────────────────────────────────────────────

export async function createMemberAction(data: StaffMemberInput): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await createStaffMember(data);
    revalidateStaff();
    return { success: true };
  } catch (e) {
    console.error("[staff] createMember failed:", e);
    return { success: false, error: String(e) };
  }
}

export async function updateMemberAction(id: string, data: Partial<StaffMemberInput>): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await updateStaffMember(id, data);
    revalidateStaff();
    return { success: true };
  } catch (e) {
    console.error("[staff] updateMember failed:", e);
    return { success: false, error: String(e) };
  }
}

export async function deleteMemberAction(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  try {
    await deleteStaffMember(id);
    revalidateStaff();
    return { success: true };
  } catch (e) {
    console.error("[staff] deleteMember failed:", e);
    return { success: false, error: String(e) };
  }
}
