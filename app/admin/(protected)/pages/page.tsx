import { requireAuth } from "@/lib/auth";
import Link from "next/link";
import { FileEdit, Home, Phone, BookOpen, ArrowRight, ExternalLink } from "lucide-react";

export const metadata = { title: "Page Editors — IC IITP Admin" };

const PAGES = [
  {
    title: "Home",
    route: "/",
    description: "Hero section, about text, key stats, and the apply CTA block.",
    editFields: ["About section copy", "Key stats (startups, jobs, funding)", "Hero image", "Apply CTA text"],
    href: "/admin/pages/home",
    liveHref: "/",
    icon: <Home className="w-5 h-5" />,
    note: "Appears on the landing page visible to all visitors.",
  },
  {
    title: "Contact",
    route: "/contact",
    description: "Office address, phone numbers, email, office hours, and map embed URL.",
    editFields: ["Street address & pin", "Phone & email", "Office hours", "Google Maps embed URL"],
    href: "/admin/pages/contact",
    liveHref: "/contact",
    icon: <Phone className="w-5 h-5" />,
    note: "Used in the Contact page and footer contact block.",
  },
  {
    title: "About",
    route: "/about",
    description: "Key imagery shown on the About page — building exterior, inauguration, and ceremony photos with captions.",
    editFields: ["Building exterior photo", "Inauguration photo", "Ceremony photo", "Caption text for each image"],
    href: "/admin/pages/about",
    liveHref: "/about",
    icon: <BookOpen className="w-5 h-5" />,
    note: "Images appear in the gallery grid on the About page.",
  },
];

export default async function PagesIndexPage() {
  await requireAuth();
  return (
    <main className="p-6">
      <div className="flex items-center gap-3 mb-1">
        <FileEdit className="w-6 h-6" style={{ color: "var(--color-brand-800)" }} />
        <h1 className="text-2xl font-black" style={{ color: "var(--color-brand-950)" }}>Page Editors</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
          {PAGES.length} pages
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Edit editable sections of static pages. Changes save to the CMS and go live immediately — no redeploy needed.
      </p>

      <div className="space-y-4">
        {PAGES.map((page) => (
          <div
            key={page.href}
            className="rounded-2xl bg-white overflow-hidden"
            style={{ border: "1px solid #e4edd9" }}
          >
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 px-5 py-4" style={{ borderBottom: "1px solid #f0f7e6" }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-brand-800)" }}>
                  {page.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: "var(--color-brand-950)" }}>{page.title}</p>
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: "#eef4e6", color: "var(--color-brand-800)" }}>
                      iciitp.com{page.route}
                    </code>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{page.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={page.liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "var(--color-surface-card)", color: "var(--color-text-secondary)", border: "1px solid #e4edd9" }}
                >
                  <ExternalLink className="w-3 h-3" /> View live
                </a>
                <Link
                  href={page.href}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg"
                  style={{ backgroundColor: "var(--color-brand-800)", color: "white" }}
                >
                  Edit <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Fields + note row */}
            <div className="px-5 py-3 flex items-start gap-6 flex-wrap" style={{ backgroundColor: "#fafdf7" }}>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  Editable fields
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {page.editFields.map((f) => (
                    <span
                      key={f}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "#e8f2e0", color: "var(--color-brand-800)" }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="shrink-0 max-w-xs">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  Where it appears
                </p>
                <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{page.note}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: "var(--color-surface-tint)", color: "var(--color-text-secondary)", border: "1px solid #e4edd9" }}>
        <strong style={{ color: "var(--color-brand-800)" }}>Note:</strong> Only the fields listed above are editable here. Layout, navigation, and programme content are managed separately under <strong>Content</strong>.
      </div>
    </main>
  );
}
