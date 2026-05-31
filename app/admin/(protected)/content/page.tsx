import { requireAuth } from "@/lib/auth";
import { Bell, Calendar, BookOpen, Download } from "lucide-react";

export const metadata = { title: "Content — IC IITP Admin" };

const SECTIONS = [
  {
    href: "/admin/content/notifications",
    icon: Bell,
    label: "Notifications",
    description: "Careers, tenders, calls for proposals",
  },
  {
    href: "/admin/content/events",
    icon: Calendar,
    label: "Events",
    description: "Upcoming and past events",
  },
  {
    href: "/admin/content/programs",
    icon: BookOpen,
    label: "Programs",
    description: "Incubation schemes and fellowships",
  },
  {
    href: "/admin/content/downloads",
    icon: Download,
    label: "Downloads",
    description: "Annual reports, brochures, policies",
  },
];

export default async function ContentIndexPage() {
  await requireAuth();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-black mb-2" style={{ color: "var(--color-brand-950)" }}>Content</h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
        Manage all CMS content published on the website.
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        {SECTIONS.map(({ href, icon: Icon, label, description }) => (
          <a
            key={href}
            href={href}
            className="flex items-start gap-4 p-5 rounded-xl border transition-all hover:shadow-md"
            style={{ borderColor: "var(--color-border-subtle)", backgroundColor: "#fafdf7" }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--color-surface-tint)" }}>
              <Icon className="w-5 h-5" style={{ color: "var(--color-brand-800)" }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--color-brand-950)" }}>{label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>{description}</p>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
