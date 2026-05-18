"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, ChevronDown, Bell, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";

interface NavItem {
  href: string;
  label: string;
  children?: { href: string; label: string }[];
}

function useNavItems() {
  const t = useTranslations("nav");
  const ta = useTranslations("nav_about");
  const tp = useTranslations("nav_programs");
  const tpo = useTranslations("nav_portfolio");
  const tf = useTranslations("nav_facilities");
  const te = useTranslations("nav_events");
  const tn = useTranslations("nav_notifications");

  const [cmsEventItems, setCmsEventItems] = useState<{ href: string; label: string }[]>([]);
  const [cmsProgramItems, setCmsProgramItems] = useState<{ href: string; label: string }[]>([]);

  const fetchCmsEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events/published");
      if (!res.ok) return;
      const data: { slug: string; title: string }[] = await res.json();
      const staticSlugs = new Set(["medtech-school", "edpi-2025", "ideathon", "training-program"]);
      setCmsEventItems(
        data
          .filter((e) => !staticSlugs.has(e.slug))
          .map((e) => ({ href: `/events/${e.slug}`, label: e.title }))
      );
    } catch { /* ignore */ }
  }, []);

  const fetchCmsPrograms = useCallback(async () => {
    try {
      const res = await fetch("/api/programs/published");
      if (!res.ok) return;
      const data: { slug: string; title: string }[] = await res.json();
      setCmsProgramItems(data.map((p) => ({ href: `/programs/${p.slug}`, label: p.title })));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchCmsEvents(); fetchCmsPrograms(); }, [fetchCmsEvents, fetchCmsPrograms]);

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
    {
      href: "/programs",
      label: t("programs"),
      children: [
        { href: "/programs", label: tp("overview") },
        { href: "/programs/icitp-incubation", label: tp("flagship") },
        { href: "/programs/nidhi-prayas", label: tp("nidhiPrayas") },
        { href: "/programs/nidhi-eir", label: tp("nidhiEir") },
        { href: "/programs/sisf", label: tp("sisf") },
        { href: "/programs/bionest", label: tp("bionest") },
        { href: "/programs/genesis", label: tp("genesis") },
        ...cmsProgramItems,
      ],
    },
    {
      href: "/portfolio",
      label: t("portfolio"),
      children: [
        { href: "/portfolio", label: tpo("all") },
        { href: "/portfolio/meity", label: tpo("meity") },
        { href: "/portfolio/sisf", label: tpo("sisf") },
        { href: "/portfolio/nidhi-prayas", label: tpo("nidhiPrayas") },
        { href: "/portfolio/nidhi-eir", label: tpo("nidhiEir") },
        { href: "/portfolio/genesis", label: tpo("genesis") },
      ],
    },
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
    {
      href: "/events",
      label: t("events"),
      children: [
        { href: "/events", label: te("overview") },
        { href: "/events/medtech-school", label: te("medtech") },
        { href: "/events/edpi-2025", label: te("edpi") },
        { href: "/events/ideathon", label: te("ideathon") },
        { href: "/events/training-program", label: te("training") },
        ...cmsEventItems,
        { href: "/events/archive", label: te("archive") },
      ],
    },
    {
      href: "/notifications",
      label: t("notifications"),
      children: [
        { href: "/notifications", label: tn("overview") },
        { href: "/notifications/careers", label: tn("careers") },
        { href: "/notifications/call-for-proposals", label: tn("callForProposals") },
        { href: "/notifications/niq-tender", label: tn("niqTender") },
      ],
    },
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
          color: isHome || isActive ? "#3a5214" : "#1c1a14",
          backgroundColor: isHome || isActive ? "#f4f8e8" : "transparent",
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
          color: isActive || open ? "#3a5214" : "#1c1a14",
          backgroundColor: isActive || open ? "#f4f8e8" : "transparent",
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
                  color: isChildActive ? "#3a5214" : "#1c1a14",
                  backgroundColor: isChildActive ? "#f0f7e6" : "transparent",
                  fontWeight: isChildActive ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!isChildActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#f4f8e8";
                    (e.currentTarget as HTMLElement).style.color = "#3a5214";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isChildActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#1c1a14";
                  }
                }}
                onClick={() => setOpen(false)}
              >
                {isChildActive && (
                  <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: "#3a5214" }} />
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

interface LiveEvent { slug: string; title: string }
interface LiveNotif { id: string; title: string; category: string; href: string }

function LiveUpdatesPanel() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [notifs, setNotifs] = useState<LiveNotif[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [evRes, noRes] = await Promise.all([
        fetch("/api/events/published"),
        fetch("/api/notifications/published"),
      ]);
      if (evRes.ok) setEvents(await evRes.json());
      if (noRes.ok) setNotifs(await noRes.json());
    } catch { /* ignore */ }
  }, []);

  // Fetch on open, then auto-refresh every 30 s while open
  useEffect(() => {
    if (!open) return;
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [open, fetchData]);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const total = events.length + notifs.length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Live events and notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors"
        style={{ color: "#3a5214", backgroundColor: open ? "#f4f8e8" : "transparent" }}
      >
        <Bell className="w-5 h-5" aria-hidden="true" />
        {total > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white text-[9px] font-bold"
            style={{ backgroundColor: "#f79420" }}
          >
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-96 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
          style={{ backgroundColor: "#ffffff", border: "1px solid #dde0d4" }}
        >
          {/* Header */}
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #f0f0ec" }}>
            <Bell className="w-4 h-4 shrink-0" style={{ color: "#3a5214" }} aria-hidden="true" />
            <span className="text-sm font-bold" style={{ color: "#3a5214" }}>Live Updates</span>
          </div>

          {/* Events */}
          <div className="px-5 py-4">
            <Link
              href="/events"
              onClick={() => setOpen(false)}
              className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 hover:underline w-fit"
              style={{ color: "#5a7c20" }}
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" /> Events
            </Link>
            {events.length === 0 ? (
              <p className="text-sm text-gray-400 py-1">No active events right now.</p>
            ) : (
              <ul className="space-y-2">
                {events.map((e) => (
                  <li key={e.slug}>
                    <Link
                      href={`/events/${e.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between gap-3 group rounded-lg px-3 py-2.5 transition-colors"
                      style={{ backgroundColor: "#fafaf8" }}
                      onMouseEnter={(el) => (el.currentTarget.style.backgroundColor = "#f4f8e8")}
                      onMouseLeave={(el) => (el.currentTarget.style.backgroundColor = "#fafaf8")}
                    >
                      <span className="text-sm text-gray-800 line-clamp-1 flex-1 group-hover:text-green-800 transition-colors">{e.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#3a5214" }} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ borderTop: "1px solid #f0f0ec" }} />

          {/* Notifications */}
          <div className="px-5 py-4">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5 hover:underline w-fit"
              style={{ color: "#5a7c20" }}
            >
              <Bell className="w-3.5 h-3.5" aria-hidden="true" /> Notifications
            </Link>
            {notifs.length === 0 ? (
              <p className="text-sm text-gray-400 py-1">No active notifications right now.</p>
            ) : (
              <ul className="space-y-2">
                {notifs.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="group block rounded-lg px-3 py-2.5 transition-colors"
                      style={{ backgroundColor: "#fafaf8" }}
                      onMouseEnter={(el) => (el.currentTarget.style.backgroundColor = "#f4f8e8")}
                      onMouseLeave={(el) => (el.currentTarget.style.backgroundColor = "#fafaf8")}
                    >
                      {n.category && (
                        <span className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: "#5a7c20" }}>{n.category}</span>
                      )}
                      <span className="text-sm text-gray-800 group-hover:text-green-800 transition-colors line-clamp-2 leading-snug">{n.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

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
    <header className="sticky top-0 z-40 backdrop-blur-md border-b no-print" style={{ backgroundColor: "rgba(250,250,248,0.97)", borderColor: "#dde0d4" }}>
      {/* Identity bar — orange accent left + right stripes + olive background */}
      <div className="text-white text-sm py-2.5 relative overflow-hidden" style={{ backgroundColor: "#3a5214" }}>
        <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: "#f79420" }} aria-hidden="true" />
        <span className="absolute right-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: "#f79420" }} aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span className="font-semibold tracking-widest uppercase">Incubation Centre · IIT Patna</span>
          <span aria-hidden="true" className="text-white/80 tracking-wide hidden sm:block">
            India&apos;s leading ESDM &amp; Medical Electronics Incubator
          </span>
        </div>
      </div>

      <nav
        id="main-nav"
        aria-label="Primary navigation"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="IC IITP – Home"
          >
            <Image
              src="/logo.png"
              alt="IC IIT Patna"
              width={44}
              height={44}
              className="shrink-0 rounded-full"
              priority
            />
            <span className="hidden sm:block text-xs font-medium leading-tight" style={{ color: "#4a6a18" }}>
              IIT Patna<br />Incubation Centre
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 ml-4">
            {navItems.map((item) => (
              <DropdownItem key={item.href} item={item} />
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/apply"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-sm font-semibold text-white rounded-md"
              style={{
                backgroundColor: "#f79420",
                opacity: showApply ? 1 : 0,
                pointerEvents: showApply ? "auto" : "none",
                transform: showApply ? "translateY(0)" : "translateY(-6px)",
                transition: "opacity 0.25s ease, transform 0.25s ease",
              }}
            >
              Apply
            </Link>
            <LiveUpdatesPanel />
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
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            id="mobile-menu"
            className="lg:hidden border-t border-[--color-border] py-3 space-y-1"
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
          </div>
        )}
      </nav>
    </header>
  );
}
