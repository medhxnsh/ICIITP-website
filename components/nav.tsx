"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

function useNavItems() {
  const t = useTranslations("nav");
  const ta = useTranslations("nav_about");
  const tf = useTranslations("nav_facilities");
  const items: NavItem[] = [
    { href: "/", label: t("home") },
    {
      href: "/about",
      label: t("about"),
      children: [
        { href: "/about", label: ta("overview") },
        { href: "/about/governance", label: ta("governance") },
        { href: "/about/evaluation-team", label: ta("evaluationTeam") },
        { href: "/about/staff", label: ta("staff") },
      ],
    },
    { href: "/programs", label: t("programs") },
    { href: "/portfolio", label: t("portfolio") },
    {
      href: "/facilities",
      label: t("facilities"),
      children: [
        { href: "/facilities", label: tf("overview") },
        { href: "/facilities/clean-room", label: tf("cleanRoom") },
        { href: "/facilities/design-sim", label: tf("designSim") },
        { href: "/facilities/esdm", label: tf("esdm") },
        { href: "/facilities/mech-packaging", label: tf("mechPackaging") },
        { href: "/facilities/pcb-fab", label: tf("pcbFab") },
        { href: "/facilities/test-cal", label: tf("testCal") },
      ],
    },
    { href: "/events", label: t("events") },
    { href: "/notifications", label: t("notifications") },
    { href: "/news", label: t("news") },
    { href: "/contact", label: t("contact") },
  ];
  return items;
}

function DropdownItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href) && item.href !== "/";
  const isHome = item.href === "/" && pathname === "/";

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  if (!item.children) {
    return (
      <Link
        href={item.href}
        aria-current={isHome || isActive ? "page" : undefined}
        className="px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap"
        style={{
          color: isHome || isActive ? "var(--color-brand-800)" : "var(--color-text)",
          backgroundColor: isHome || isActive ? "var(--color-brand-50)" : "transparent",
        }}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded transition-colors whitespace-nowrap"
        style={{
          color: isActive || open ? "var(--color-brand-800)" : "var(--color-text)",
          backgroundColor: isActive || open ? "var(--color-brand-50)" : "transparent",
        }}
      >
        {item.label}
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full left-0 mt-1 min-w-48 rounded-md py-1 z-[9999]"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dde0d4",
            boxShadow: "0 4px 20px rgb(0 0 0 / 0.12)",
          }}
        >
          {item.children.map((child) => {
            const isChildActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                role="menuitem"
                aria-current={isChildActive ? "page" : undefined}
                className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                style={{
                  color: isChildActive ? "var(--color-brand-800)" : "var(--color-text)",
                  backgroundColor: isChildActive ? "var(--color-surface-tint)" : "transparent",
                  fontWeight: isChildActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isChildActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-brand-50)";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-brand-800)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isChildActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "var(--color-text)";
                  }
                }}
                onClick={() => setOpen(false)}
              >
                {isChildActive && (
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "var(--color-brand-800)" }} />
                )}
                <span className={isChildActive ? "" : "pl-3"}>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}


export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const t = useTranslations("a11y");
  const navItems = useNavItems();

  const pathname = usePathname();
  useEffect(() => {
    // On the home page, reveal Apply after scrolling past the hero.
    // On every other page, always show it.
    if (pathname !== "/") { setShowApply(true); return; }
    const onScroll = () => setShowApply(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 no-print" style={{ pointerEvents: "none" }}>

      {/* ── Full-width fixed dark-green identity ribbon ── */}
      <div
        className="text-white text-sm py-2.5 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-brand-800)", pointerEvents: "auto" }}
      >
        <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: "var(--color-accent)" }} aria-hidden="true" />
        <span className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: "var(--color-accent)" }} aria-hidden="true" />
        <div className="w-full px-5 flex items-center justify-between">
          <span className="font-semibold tracking-widest uppercase text-xs sm:text-sm">Incubation Centre · IIT Patna</span>
          <span aria-hidden="true" className="text-white/75 tracking-wide text-xs hidden sm:block">
            India&apos;s leading ESDM &amp; Medical Electronics Incubator
          </span>
        </div>
      </div>

      {/* ── Centered floating glass nav bar ── */}
      <div className="px-4 pt-1.5">
        <div
          className="mx-auto rounded-2xl overflow-visible"
          style={{
            maxWidth: "1080px",
            pointerEvents: "auto",
            backgroundColor: "rgba(250,250,248,0.92)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(221,224,212,0.8)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <nav
            id="main-nav"
            aria-label="Primary navigation"
            className="px-4 sm:px-5"
          >
            <div className="flex items-center h-12 gap-3">
              {/* Logo */}
              <Link
                href="/"
                className="flex items-center gap-2 shrink-0"
                aria-label="IC IITP – Home"
              >
                <Image
                  src="/logo.png"
                  alt="IC IIT Patna"
                  width={36}
                  height={36}
                  className="shrink-0 rounded-full"
                  priority
                />
                <span className="hidden sm:block text-[11px] font-medium leading-tight" style={{ color: "#4a6a18" }}>
                  IIT Patna<br />Incubation Centre
                </span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden lg:flex items-center gap-0 ml-2">
                {navItems.map((item) => (
                  <DropdownItem key={item.href} item={item} />
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2">
                {/* Apply Now — hidden on home until past hero, always visible elsewhere */}
                <Link
                  href="/apply"
                  className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    opacity: showApply ? 1 : 0,
                    pointerEvents: showApply ? "auto" : "none",
                    transform: showApply ? "translateY(0)" : "translateY(-6px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                  }}
                >
                  Apply Now
                </Link>
                {/* Mobile hamburger */}
                <button
                  type="button"
                  className="lg:hidden text-[--color-text] hover:text-[--color-primary] transition-colors"
                  aria-expanded={mobileOpen}
                  aria-controls="mobile-menu"
                  aria-label={mobileOpen ? t("closeMenu") : t("openMenu")}
                  onClick={() => setMobileOpen((v) => !v)}
                >
                  {mobileOpen ? (
                    <X className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
              <div
                id="mobile-menu"
                className="lg:hidden border-t py-3 space-y-1"
                style={{ borderColor: "rgba(221,224,212,0.6)" }}
              >
                {navItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      className="block px-3 py-2 text-sm font-medium text-[--color-text] hover:text-[--color-primary] hover:bg-[--color-brand-50] rounded-[--radius-sm] transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <div className="ml-4 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-1.5 text-sm text-[--color-text-subtle] hover:text-[--color-primary] hover:bg-[--color-brand-50] rounded-[--radius-sm] transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div className="pt-2 pb-1 px-3">
                  <Link
                    href="/apply"
                    className="block w-full text-center px-4 py-2 text-sm font-semibold text-white rounded-lg"
                    style={{ backgroundColor: "var(--color-accent)" }}
                    onClick={() => setMobileOpen(false)}
                  >
                    Apply Now
                  </Link>
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

    </header>
  );
}
