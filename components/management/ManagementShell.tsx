"use client";

import { Inter } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./management.module.css";

const inter = Inter({ subsets: ["latin"], variable: "--management-font" });

export type ManagementRole = "Admin" | "Superadmin";

export const managementRoutes = {
  Admin: { Overview: "/admin/overview", Users: "/admin", Projects: "/admin/projects", Vendors: null },
  Superadmin: { Overview: "/superadmin/overview", Users: "/superadmin/users", Projects: "/superadmin", Vendors: "/superadmin/vendors" },
} as const;

const navigation = [
  { name: "Overview", icon: "grid" },
  { name: "Users", icon: "door" },
  { name: "Projects", icon: "grid" },
  { name: "Vendors", icon: "grid" },
  { name: "Integrations", icon: "sliders", disabled: true },
  { name: "Audit Logs", icon: "chart", disabled: true },
  { name: "Settings", icon: "sliders", disabled: true },
] as const;

export function Icon({ name }: { name: string }) {
  return (
    <svg aria-hidden="true" width="16" height="16" className={styles.icon}>
      <use href={`/nexus-navigation.svg#${name}`} />
    </svg>
  );
}

export function ManagementShell({
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
  const routes = managementRoutes[role];

  return (
    <div className={`${styles.shell} ${inter.variable}`}>
      <header className={styles.header}>
        <Link className={styles.brand} href={routes.Overview}>NEXUS</Link>
        <div className={styles.headerActions}>
          <input className={styles.headerSearch} type="search" placeholder="Search users, projects, vendors..."
            aria-label={searchLabel} value={query} disabled={!onQueryChange} onChange={(event) => onQueryChange?.(event.target.value)} />
          <Icon name="bell" />
          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">JD</span>
            <span><strong>John Doe</strong><small>{role}</small></span>
          </div>
        </div>
      </header>
      <nav className={styles.sidebar} aria-label={`${role} management`}>
        {navigation.map((item) => {
          const href = "disabled" in item ? null : routes[item.name];
          return href ? (
            <Link key={item.name} href={href} aria-current={active === item.name ? "page" : undefined}>
              <Icon name={item.icon} />{item.name}
            </Link>
          ) : (
            <span key={item.name} aria-disabled="true"><Icon name={item.icon} />{item.name}</span>
          );
        })}
      </nav>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
