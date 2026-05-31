"use server";
import { requireAuth } from "@/lib/auth";
import { createCmsStartup, updateCmsStartup, deleteCmsStartup, bulkImportStartups, type CmsStartup } from "@/lib/cms/startups";
import { revalidatePath } from "next/cache";

export async function saveStartupAction(
  id: string | null,
  data: Omit<CmsStartup, "id" | "createdAt" | "updatedAt">
) {
  await requireAuth();
  if (id) {
    await updateCmsStartup(id, data);
  } else {
    await createCmsStartup(data);
  }
  revalidatePath("/admin/content/startups");
  revalidatePath("/[locale]/portfolio", "page");
}

export async function deleteStartupAction(id: string) {
  await requireAuth();
  await deleteCmsStartup(id);
  revalidatePath("/admin/content/startups");
  revalidatePath("/[locale]/portfolio", "page");
}

export async function bulkImportAction(rows: Partial<CmsStartup>[]) {
  await requireAuth();
  const result = await bulkImportStartups(rows);
  revalidatePath("/admin/content/startups");
  revalidatePath("/[locale]/portfolio", "page");
  return result;
}
