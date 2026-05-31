"use server";

import { requireAuth } from "@/lib/auth";
import { upsertPageSection, type HomeStat } from "@/lib/cms/page-sections";
import { revalidateTag } from "next/cache";

// ── Home ──────────────────────────────────────────────────────────────────────

export async function saveHomeSectionAction(formData: FormData) {
  await requireAuth();

  const statsRaw = formData.get("stats") as string;
  let stats: HomeStat[] = [];
  try { stats = JSON.parse(statsRaw); } catch {}

  await upsertPageSection("home", {
    about_headline:       (formData.get("about_headline") as string) ?? "",
    about_body_1:         (formData.get("about_body_1")  as string) ?? "",
    about_body_2:         (formData.get("about_body_2")  as string) ?? "",
    cta_headline:         (formData.get("cta_headline")  as string) ?? "",
    cta_body:             (formData.get("cta_body")      as string) ?? "",
    building_image_url:   (formData.get("building_image_url")   as string) ?? "",
    team_staff_image_url: (formData.get("team_staff_image_url") as string) ?? "",
    team_group_image_url: (formData.get("team_group_image_url") as string) ?? "",
    stats,
  });

  revalidateTag("page-section-home", "default");
  return { success: true };
}

// ── Contact ───────────────────────────────────────────────────────────────────

export async function saveContactSectionAction(formData: FormData) {
  await requireAuth();

  await upsertPageSection("contact", {
    address:          (formData.get("address")          as string) ?? "",
    enquiries_name:   (formData.get("enquiries_name")   as string) ?? "",
    enquiries_phone:  (formData.get("enquiries_phone")  as string) ?? "",
    incubation_name:  (formData.get("incubation_name")  as string) ?? "",
    incubation_phone: (formData.get("incubation_phone") as string) ?? "",
    email:            (formData.get("email")            as string) ?? "",
    hours:            (formData.get("hours")            as string) ?? "",
    maps_embed_url:   (formData.get("maps_embed_url")   as string) ?? "",
  });

  revalidateTag("page-section-contact", "default");
  return { success: true };
}

// ── About ─────────────────────────────────────────────────────────────────────

export async function saveAboutSectionAction(formData: FormData) {
  await requireAuth();

  await upsertPageSection("about", {
    building_image_url:      (formData.get("building_image_url")      as string) ?? "",
    inauguration_image_url:  (formData.get("inauguration_image_url")  as string) ?? "",
    inauguration_caption:    (formData.get("inauguration_caption")    as string) ?? "",
    ceremony_image_url:      (formData.get("ceremony_image_url")      as string) ?? "",
    ceremony_overlay_title:  (formData.get("ceremony_overlay_title")  as string) ?? "",
    ceremony_overlay_body:   (formData.get("ceremony_overlay_body")   as string) ?? "",
  });

  revalidateTag("page-section-about", "default");
  return { success: true };
}
