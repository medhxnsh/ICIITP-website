"use server";

import { requireAuth } from "@/lib/auth";
import { updateLab } from "@/lib/cms/labs";
import { revalidatePath } from "next/cache";

export async function updateLabAction(
  slug: string,
  _prev: { ok?: boolean; error?: string } | null,
  formData: FormData
): Promise<{ ok?: boolean; error?: string }> {
  await requireAuth();

  const title = formData.get("title")?.toString().trim();
  const tagline = formData.get("tagline")?.toString().trim() || undefined;
  const description = formData.get("description")?.toString().trim() || undefined;

  if (!title) return { error: "Title is required." };

  try {
    await updateLab(slug, { title, tagline, description });
    revalidatePath("/admin/content/labs");
    revalidatePath(`/admin/content/labs/${slug}`);
    revalidatePath("/");
    revalidatePath("/facilities");
    revalidatePath(`/facilities/${slug}`);
    return { ok: true };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : "Failed to save." };
  }
}
