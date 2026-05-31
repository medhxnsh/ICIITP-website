"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  FileEdit,
  FolderOpen,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Settings,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { AdminSession } from "@/lib/auth";
import { logoutAction } from "./login/actions";

interface SidebarProps {
  user: AdminSession;
}

type NavItem =
  | { type: "link"; label: string; href: string; icon: React.ReactNode; permission?: string }
  | { type: "group"; label: string; icon: React.ReactNode; children: { label: string; href: string; permission: string }[] };

const NAV: NavItem[] = [
  { type: "link",  label: "Dashboard",    href: "/admin",                icon: <LayoutDashboard className="w-4 h-4" /> },
  { type: "link",  label: "Applications", href: "/admin/applications",   icon: <ClipboardList className="w-4 h-4" />,  permission: "applications" },
  { type: "link",  label: "Pages",        href: "/admin/pages",          icon: <FileEdit className="w-4 h-4" />,       permission: "pages" },
  {
    type: "group",
    label: "Content",
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { label: "Notifications", href: "/admin/content/notifications", permission: "notifications" },
      { label: "Programs",      href: "/admin/content/programs",      permission: "programs" },
      { label: "Events",        href: "/admin/content/events",        permission: "events" },
      { label: "News",          href: "/admin/content/news",          permission: "news" },
      { label: "Labs",          href: "/admin/content/labs",          permission: "labs" },
      { label: "Downloads",     href: "/admin/content/downloads",     permission: "downloads" },
      { label: "Portfolio",     href: "/admin/content/startups",      permission: "startups" },
      { label: "Staff",         href: "/admin/content/staff",         permission: "staff" },
    ],
  },
  { type: "link",  label: "Media",        href: "/admin/media",          icon: <FolderOpen className="w-4 h-4" />,     permission: "media" },
];

const SUPER_ADMIN_NAV: NavItem[] = [
  { type: "link", label: "Users",    href: "/admin/users",    icon: <Users className="w-4 h-4" /> },
  { type: "link", label: "Settings", href: "/admin/settings", icon: <Settings className="w-4 h-4" /> },
];

function hasAccess(permission: string | undefined, superAdmin: boolean, permissions: string[]): boolean {
  if (superAdmin) return true;
  if (!permission) return true; // Dashboard — always visible
  return permissions.includes(permission);
}

function NavLink({ href, label, icon, collapsed }: { href: string; label: string; icon: React.ReactNode; collapsed: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className="flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors"
      style={
        active
          ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" }
          : { color: "rgba(255,255,255,0.70)" }
      }
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && label}
    </Link>
  );
}

function NavGroup({ label, icon, children, collapsed }: {
  label: string;
  icon: React.ReactNode;
  children: { label: string; href: string }[];
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const anyActive = children.some((c) => pathname.startsWith(c.href));
  const [open, setOpen] = useState(anyActive);

  if (collapsed) {
    return (
      <div title={label}>
        <span
          className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium"
          style={{ color: anyActive ? "white" : "rgba(255,255,255,0.70)" }}
        >
          {icon}
        </span>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-3 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-colors"
        style={{ color: anyActive ? "white" : "rgba(255,255,255,0.70)" }}
      >
        <span className="flex items-center gap-3">
          {icon}
          {label}
        </span>
        <ChevronDown
          className="w-3.5 h-3.5 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div className="mt-0.5 ml-7 space-y-0.5">
          {children.map((c) => {
            const active = pathname.startsWith(c.href);
            return (
              <Link
                key={c.href}
                href={c.href}
                className="flex items-center px-3 py-1.5 min-h-[44px] rounded-md text-sm transition-colors"
                style={
                  active
                    ? { backgroundColor: "rgba(255,255,255,0.15)", color: "white" }
                    : { color: "rgba(255,255,255,0.60)" }
                }
              >
                {c.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AdminSidebar({ user }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggle() {
    setCollapsed((c) => {
      localStorage.setItem("admin-sidebar-collapsed", String(!c));
      return !c;
    });
  }

  const perms = user.permissions ?? [];

  return (
    <aside
      className="shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto transition-all duration-200"
      style={{ width: collapsed ? 56 : 240, backgroundColor: "var(--color-brand-800)" }}
    >
      {/* Wordmark + collapse toggle */}
      <div
        className="flex items-center justify-between px-3 py-4 border-b"
        style={{ borderColor: "rgba(255,255,255,0.12)" }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-1">
            <Image
              src="/logo.png"
              alt="IC IITP"
              width={30}
              height={30}
              className="rounded-lg shrink-0"
            />
            <div>
              <p className="font-black text-white text-sm leading-tight">IC IITP</p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                Staff Portal
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className="p-2.5 rounded-md transition-colors hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
          style={{ color: "rgba(255,255,255,0.70)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-1.5 py-4 space-y-0.5" aria-label="Admin navigation">
        {NAV.map((item) => {
          if (item.type === "link") {
            if (!hasAccess(item.permission, user.superAdmin, perms)) return null;
            return <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} collapsed={collapsed} />;
          }
          // Group: filter children by permission
          const visibleChildren = user.superAdmin
            ? item.children
            : item.children.filter((c) => perms.includes(c.permission));
          if (visibleChildren.length === 0) return null;
          return (
            <NavGroup key={item.label} label={item.label} icon={item.icon} children={visibleChildren} collapsed={collapsed} />
          );
        })}

        {user.superAdmin && (
          <>
            {!collapsed && (
              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.35)" }}>
                System
              </p>
            )}
            {SUPER_ADMIN_NAV.map((item) =>
              item.type === "link" ? (
                <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} collapsed={collapsed} />
              ) : null
            )}
          </>
        )}
      </nav>

      {/* User pill + sign out */}
      <div className="px-1.5 pb-4 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-2 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
              aria-hidden="true"
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] capitalize" style={{ color: "rgba(255,255,255,0.55)" }}>
                {user.role}
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mx-auto mb-2"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2 min-h-[44px] rounded-lg text-sm transition-colors"
            style={{ color: "rgba(255,255,255,0.60)" }}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            {!collapsed && "Sign out"}
          </button>
        </form>
      </div>
    </aside>
  );
}
