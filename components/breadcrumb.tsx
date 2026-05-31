import { Link } from "@/i18n/navigation";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  variant?: "default" | "light";
}

export function Breadcrumb({ items, variant = "default" }: BreadcrumbProps) {
  const isLight = variant === "light";
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className={`flex items-center flex-wrap gap-1 text-sm ${isLight ? "text-white/75" : "text-[--color-muted]"}`}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={isLast ? `font-medium ${isLight ? "text-white/90" : "text-[--color-text]"}` : ""}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`transition-colors ${isLight ? "hover:text-white/80" : "hover:text-[--color-primary]"}`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
