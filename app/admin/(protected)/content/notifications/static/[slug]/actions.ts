"use server";

import { requireAuth } from "@/lib/auth";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { revalidatePath } from "next/cache";

const VALID_SLUGS = ["careers", "call-for-proposals", "niq-tender"] as const;

export interface RecruitmentDocumentInput {
  label: string;
  url: string;
  type: string;
}

export interface RecruitmentEntryInput {
  sn: number;
  position: string;
  notificationDate: string;
  deadline: string;
  status: "open" | "closed" | "cancelled";
  documents: RecruitmentDocumentInput[];
}

export interface StaticNotificationFormData {
  title: string;
  summary: string;
  body: string;
  purpose: string;
  validFrom: string;
  validTo: string;
  contactEmail: string;
  externalUrl: string;
  downloads: Array<{ title: string; path: string; format: string }>;
  recruitmentTable?: RecruitmentEntryInput[];
}

export async function saveStaticNotificationAction(
  slug: string,
  data: StaticNotificationFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAuth();
  if (!VALID_SLUGS.includes(slug as (typeof VALID_SLUGS)[number])) {
    return { success: false, error: "Invalid notification slug." };
  }

  try {
    const filePath = join(process.cwd(), "content", "en", "notifications", `${slug}.json`);
    const current = JSON.parse(readFileSync(filePath, "utf-8"));

    const updated: Record<string, unknown> = {
      ...current,
      title: data.title.trim() || current.title,
      summary: data.summary.trim() || current.summary,
      body: data.body.trim() || current.body,
      purpose: data.purpose.trim() || current.purpose,
      validFrom: data.validFrom || current.validFrom,
      validTo: data.validTo || current.validTo,
    };

    if (data.contactEmail.trim()) updated.contactEmail = data.contactEmail.trim();
    if (data.externalUrl.trim()) updated.externalUrl = data.externalUrl.trim();
    else delete updated.externalUrl;
    if (data.downloads.length > 0) updated.downloads = data.downloads;
    else delete updated.downloads;
    if (data.recruitmentTable && data.recruitmentTable.length > 0) {
      updated.recruitmentTable = data.recruitmentTable.map((row, i) => ({
        sn: i + 1,
        position: row.position.trim(),
        notificationDate: row.notificationDate.trim() || undefined,
        deadline: row.deadline.trim() || undefined,
        status: row.status,
        documents: row.documents.filter((d) => d.label.trim() && d.url.trim()),
      }));
    } else {
      delete updated.recruitmentTable;
    }

    // NOTE: writes back to the repo's content JSON. Works only on
    // writable filesystems (local dev). Most serverless deploys have
    // read-only roots; if you target Vercel/Cloud Run later, migrate this
    // to a Firestore overlay collection.
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_STATIC_WRITES !== "1") {
      return {
        success: false,
        error: "Editing static JSON is disabled in production. Migrate this notification to the CMS.",
      };
    }
    writeFileSync(filePath, JSON.stringify(updated, null, 2) + "\n");

    revalidatePath(`/notifications/${slug}`);
    revalidatePath("/notifications");
    revalidatePath("/admin/content/notifications");

    return { success: true };
  } catch (err) {
    console.error("[saveStaticNotificationAction]", err);
    return { success: false, error: "Failed to save notification." };
  }
}
