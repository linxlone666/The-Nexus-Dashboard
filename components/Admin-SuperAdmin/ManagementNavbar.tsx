"use client";

import { TopBar } from "@/components/TopBar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import type { ReactNode } from "react";
import { useSidebarNavigation } from "@/utils/sidebar-state";
import { useDemoProfile } from "@/utils/demo-session";
import { useSelectedWorkSite } from "@/utils/selected-work-site";
import styles from "./ManagementNavbar.module.css";

const navigation = [
  {
    label: "Overview",
    icon: "management-home",
    Admin: "/admin",
    Superadmin: "/superadmin",
  },
  {
    label: "Users",
    icon: "management-users",
    Admin: "/admin/users",
    Superadmin: "/superadmin/users",
  },
  {
    label: "Sites",
    icon: "management-projects",
    Admin: "/admin/projects",
    Superadmin: "/superadmin/sites",
  },
  {
    label: "Audit Logs",
    icon: "management-audit",
    Admin: "/admin/audit-logs",
    Superadmin: "/superadmin/audit-logs",
  },
  {
    label: "Settings",
    icon: "management-settings",
    Admin: null,
    Superadmin: "/superadmin/settings",
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
  const { collapsed, previewing, railProps, toggleProps } =
    useSidebarNavigation();
  const profile = useDemoProfile();
  const site = useSelectedWorkSite();
  const dashboardHref =
    site &&
    profile &&
    (profile.role === "Superadmin" || profile.siteIds.includes(site.id))
      ? "/home"
      : "/login/sites?view=dashboard";
  const pathname = usePathname();
  const navigationId = useId();
  const home = role === "Admin" ? "/admin" : "/superadmin";
  const menuLabel = collapsed ? "Expand sidebar" : "Collapse sidebar";

  return (
    <div
      className={styles.shell}
      data-sidebar-collapsed={collapsed}
      data-sidebar-hover={previewing}
    >
      <TopBar
        home={home}
        name="John Doe"
        initials="JD"
        roleLabel={role}
        searchLabel="Search management"
        searchPlaceholder={"Search users and sites..."}
      />

      <aside className={styles.sidebar} {...railProps}>
        <button
          className={styles.sidebarToggle}
          type="button"
          {...toggleProps}
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
          {profile?.role === role && (
            <Link
              href={dashboardHref}
              aria-label="Site dashboard"
              title={collapsed ? "Site dashboard" : undefined}
            >
              <Icon name="grid" />
              <span className={styles.sidebarLabel}>Site dashboard</span>
            </Link>
          )}
          {navigation.map((item) => {
            const href = item[role];
            const content = (
              <>
                <Icon name={item.icon} />
                <span className={styles.sidebarLabel}>{item.label}</span>
              </>
            );

            if (!href) return null;

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
