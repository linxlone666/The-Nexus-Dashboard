"use client";

import { Input } from "@/components/tailgrids/core/input";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useId } from "react";
import type { ReactNode } from "react";
import { useCollapsedSidebar } from "@/utils/sidebar-state";
import { hasPermission, sectionPermissions } from "@/utils/permissions";
import { getDashboardPath, useDemoSession } from "@/utils/demo-session";
import { SignOutButton } from "@/components/SignOutButton";
import { useManagementPreferences } from "./management-preferences";
import styles from "./management.module.css";

const inter = Inter({ subsets: ["latin"], variable: "--management-font" });

export type ManagementRole = "Admin" | "Superadmin";

// Role-specific destinations; null means that section is not available to Admin.
export const managementRoutes = {
  Admin: {
    Overview: "/admin/overview",
    Users: "/admin",
    Projects: "/admin/projects",
    Vendors: null,
    Integrations: "/admin/integrations",
    "Audit Logs": "/admin/audit-logs",
    Settings: "/admin/settings",
  },
  Superadmin: {
    Overview: "/superadmin/overview",
    Users: "/superadmin/users",
    Projects: "/superadmin",
    Vendors: "/superadmin/vendors",
    Integrations: "/superadmin/integrations",
    "Audit Logs": "/superadmin/audit-logs",
    Settings: "/superadmin/settings",
  },
} as const;

const navigation = [
  { name: "Overview", icon: "management-home" },
  { name: "Users", icon: "management-users" },
  { name: "Projects", icon: "management-projects" },
  { name: "Vendors", icon: "management-vendors" },
  { name: "Integrations", icon: "management-integrations" },
  { name: "Audit Logs", icon: "management-audit" },
  { name: "Settings", icon: "management-settings" },
] as const;

// Render one of the symbols from the shared navigation SVG sprite.
export function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" width="16" height="16" className={styles.icon}>
      <use href={`/nexus-navigation.svg#${name}`} />
    </svg>
  );
}

export function AdminSuperadminLayout({
  role,
  active,
  query = "",
  onQueryChange,
  searchLabel,
  children,
}: {
  role: ManagementRole;
  active: keyof (typeof managementRoutes)[ManagementRole];
  query?: string;
  onQueryChange?: (query: string) => void;
  searchLabel: string;
  children: ReactNode;
}) {
  // Shared management chrome provides role-aware navigation and account controls.
  const { collapsed, toggleSidebar } = useCollapsedSidebar();
  const navigationId = useId();
  const { credential, access } = useDemoSession();
  const profileName = credential?.name ?? "John Doe";
  const initials = profileName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const routes = managementRoutes[role];
  const { density } = useManagementPreferences(role);

  return (
    <div
      className={`${styles.shell} ${inter.variable}`}
      data-density={density}
      data-sidebar-collapsed={collapsed}
    >
      <header className={styles.header}>
        <Link
          className={styles.brand}
          href={
            credential ? getDashboardPath(credential.role, access) : "/login"
          }
        >
          NEXUS
        </Link>
        <div className={styles.headerActions}>
          <Input
            className={styles.headerSearch}
            type="search"
            placeholder={
              routes.Vendors
                ? "Search users, projects, vendors..."
                : "Search users, projects..."
            }
            aria-label={searchLabel}
            value={query}
            disabled={!onQueryChange}
            onChange={(event) => onQueryChange?.(event.target.value)}
          />
          <Icon name="bell" />
          <SignOutButton className={styles.switchRole} />
          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">
              {initials}
            </span>
            <span>
              <strong>{profileName}</strong>
              <small>{role}</small>
            </span>
          </div>
        </div>
      </header>
      <aside className={styles.sidebar}>
        <button
          type="button"
          className={styles.sidebarToggle}
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-controls={navigationId}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            aria-hidden="true"
            className={styles.icon}
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className={styles.sidebarToggleLabel}>Menu</span>
        </button>
        <nav
          id={navigationId}
          className={styles.sidebarLinks}
          aria-label={`${role} management`}
        >
          {/* Hide unavailable routes and sections the signed-in account cannot access. */}
          {navigation.map((item) => {
            const href = routes[item.name];
            if (
              !href ||
              !hasPermission(
                credential?.role,
                access,
                sectionPermissions[item.name],
              )
            )
              return null;
            return (
              <Link
                key={item.name}
                href={href}
                aria-label={item.name}
                title={collapsed ? item.name : undefined}
                aria-current={active === item.name ? "page" : undefined}
              >
                <Icon name={item.icon} />
                <span className={styles.sidebarLabel}>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
