"use client";

import { Input } from "@/components/tailgrids/core/input";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import type { ReactNode } from "react";
import { useCollapsedSidebar } from "./sidebar-state";
import styles from "./ManagementNavbar.module.css";

const navigation = [
  {
    label: "Overview",
    icon: "management-home",
    Admin: "/admin",
    Superadmin: null,
  },
  {
    label: "Users",
    icon: "management-users",
    Admin: null,
    Superadmin: "/superadmin/users",
  },
  {
    label: "Sites",
    icon: "management-projects",
    Admin: null,
    Superadmin: null,
  },
  {
    label: "Audit Logs",
    icon: "management-audit",
    Admin: null,
    Superadmin: null,
  },
  {
    label: "Settings",
    icon: "management-settings",
    Admin: null,
    Superadmin: null,
  },
];

type ManagementNavbarProps = {
  role: "Admin" | "Superadmin";
  children: ReactNode;
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      className={styles.icon}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <use href={`/nexus-navigation.svg#${name}`} />
    </svg>
  );
}

export function ManagementNavbar({ role, children }: ManagementNavbarProps) {
  const { collapsed, toggleSidebar } = useCollapsedSidebar();
  const pathname = usePathname();
  const navigationId = useId();
  const home = role === "Admin" ? "/admin" : "/superadmin/users";
  const menuLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <div className={styles.shell} data-sidebar-collapsed={collapsed}>
      <header className={styles.header}>
        <Link className={styles.brand} href={home}>
          NEXUS
        </Link>
        <div className={styles.headerActions}>
          <Input
            className={styles.headerSearch}
            type="search"
            aria-label="Search management"
            placeholder={
              role === "Superadmin"
                ? "Search users, projects, vendors..."
                : "Search users, projects..."
            }
            disabled
          />
          <Icon name="bell" />
          <div className={styles.profile}>
            <span className={styles.avatar} aria-hidden="true">
              JD
            </span>
            <span>
              <strong>John Doe</strong>
              <small>{role}</small>
            </span>
          </div>
        </div>
      </header>

      <aside className={styles.sidebar}>
        <button
          className={styles.sidebarToggle}
          type="button"
          onClick={toggleSidebar}
          aria-expanded={!collapsed}
          aria-controls={navigationId}
          aria-label={menuLabel}
          title={menuLabel}
        >
          <Icon name="menu" />
          <span className={styles.sidebarToggleLabel}>Menu</span>
        </button>
        <nav
          id={navigationId}
          className={styles.sidebarLinks}
          aria-label={role + " management"}
        >
          {navigation.map((item) => {
            if (role === "Admin" && item.label === "Vendors") return null;

            const href = item[role];
            const content = (
              <>
                <Icon name={item.icon} />
                <span className={styles.sidebarLabel}>{item.label}</span>
              </>
            );

            if (!href) {
              return (
                <span
                  key={item.label}
                  className={styles.placeholder}
                  title={collapsed ? item.label : undefined}
                  aria-label={item.label}
                >
                  {content}
                </span>
              );
            }

            return (
              <Link
                key={item.label}
                href={href}
                aria-label={item.label}
                title={collapsed ? item.label : undefined}
                aria-current={pathname === href ? "page" : undefined}
              >
                {content}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
