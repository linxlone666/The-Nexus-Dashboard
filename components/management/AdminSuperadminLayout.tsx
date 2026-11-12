"use client";

import { Input } from "@/components/tailgrids/core/input";
import { Inter } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import { useDemoSession } from "@/utils/demo-session";
import { SignOutButton } from "@/components/SignOutButton";
import { useManagementPreferences } from "./management-preferences";
import styles from "./management.module.css";

const inter = Inter({ subsets: ["latin"], variable: "--management-font" });

export type ManagementRole = "Admin" | "Superadmin";

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
  { name: "Overview", icon: "grid" },
  { name: "Users", icon: "door" },
  { name: "Projects", icon: "grid" },
  { name: "Vendors", icon: "grid" },
  { name: "Integrations", icon: "sliders" },
  { name: "Audit Logs", icon: "chart" },
  { name: "Settings", icon: "sliders" },
] as const;

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
  const { credential } = useDemoSession();
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
    <div className={`${styles.shell} ${inter.variable}`} data-density={density}>
      <header className={styles.header}>
        <Link className={styles.brand} href={routes.Overview}>
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
      <nav className={styles.sidebar} aria-label={`${role} management`}>
        {navigation.map((item) => {
          const href = routes[item.name];
          if (!href) return null;
          return (
            <Link
              key={item.name}
              href={href}
              aria-current={active === item.name ? "page" : undefined}
            >
              <Icon name={item.icon} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
