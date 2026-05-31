import { requireAuth } from "@/lib/auth";
import { getPageSection } from "@/lib/cms/page-sections";
import { saveAboutSectionAction } from "../actions";
import { AboutSectionForm } from "@/components/admin/about-section-form";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata = { title: "Edit About — IC IITP Admin" };

const DEFAULTS = {
  building_image_url: "",
  inauguration_image_url: "",
  inauguration_caption:
    "IC IITP was officially inaugurated as a joint initiative of the Government of India and the Government of Bihar — marking the start of a new chapter for deep-tech entrepreneurship in the region. Since then, the centre has grown into India's leading ESDM and Medical Electronics Incubator.",
  ceremony_image_url: "",
  ceremony_overlay_title: "Training programmes & certificate distribution",
  ceremony_overlay_body: "Empowering innovators across Bihar and beyond",
};

export default async function AboutEditorPage() {
  await requireAuth();
  const cms = await getPageSection("about").catch(() => null);

  const current = {
    building_image_url:     cms?.building_image_url     || DEFAULTS.building_image_url,
    inauguration_image_url: cms?.inauguration_image_url || DEFAULTS.inauguration_image_url,
    inauguration_caption:   cms?.inauguration_caption   || DEFAULTS.inauguration_caption,
    ceremony_image_url:     cms?.ceremony_image_url     || DEFAULTS.ceremony_image_url,
    ceremony_overlay_title: cms?.ceremony_overlay_title || DEFAULTS.ceremony_overlay_title,
    ceremony_overlay_body:  cms?.ceremony_overlay_body  || DEFAULTS.ceremony_overlay_body,
  };

  return (
    <main className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin/pages" className="text-sm" style={{ color: "var(--color-text-secondary)" }}>← Pages</Link>
        <span style={{ color: "var(--color-input-border)" }}>/</span>
        <BookOpen className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-xl font-black" style={{ color: "var(--color-brand-950)" }}>Edit About Page</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Replace images and update key text on the <a href="/about" target="_blank" className="underline">/about</a> page.
      </p>
      <AboutSectionForm current={current} onSave={saveAboutSectionAction} />
    </main>
  );
}
