"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "Dashboard",
  applications: "Applications",
  "site-map": "Site Map",
  pages: "Pages",
  home: "Home Page",
  contact: "Contact Page",
  about: "About Page",
  content: "Content",
  notifications: "Notifications",
  events: "Events",
  downloads: "Downloads",
  programs: "Programs",
  forms: "Form Links",
  new: "New",
  edit: "Edit",
};

function segmentLabel(seg: string) {
  return LABELS[seg] ?? seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AdminTopBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Build breadcrumb segments from path
  const parts = pathname.split("/").filter(Boolean); // ["admin", "content", "events", "new"]
  const crumbs: { label: string; href: string }[] = [];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    crumbs.push({ label: segmentLabel(part), href: acc });
  }

  const isRoot = crumbs.length <= 1;
  const currentLabel = crumbs[crumbs.length - 1]?.label ?? "Dashboard";

  return (
    <header
      className="flex items-center gap-3 px-6 py-3 border-b bg-white sticky top-0 z-20"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      {/* Back button */}
      {!isRoot && (
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-gray-100 shrink-0"
          style={{ color: "var(--color-text-body)" }}
          aria-label="Go back"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Breadcrumb trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm min-w-0">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "#b0c090" }} aria-hidden="true" />
              )}
              {isLast ? (
                <span className="font-semibold truncate" style={{ color: "var(--color-brand-950)" }}>
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.href}
                  className="truncate transition-colors hover:underline"
                  style={{ color: "var(--color-brand-600)" }}
                >
                  {crumb.label}
                </a>
              )}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
