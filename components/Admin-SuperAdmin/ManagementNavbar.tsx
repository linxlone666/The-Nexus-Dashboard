"use client";

import { TopBar } from "@/components/TopBar";
import { managementLinks } from "@/components/management/navigation";
import Link from "next/link";
import { canAccessSite } from "@/data/management";
import { usePathname } from "next/navigation";
import { useId } from "react";
import type { ReactNode } from "react";
import { useSidebarNavigation } from "@/utils/sidebar-state";
import { useDemoProfile } from "@/utils/demo-session";
import { useSelectedWorkSite } from "@/utils/selected-work-site";
import styles from "./ManagementNavbar.module.css";

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
    site && profile && canAccessSite(site, profile)
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
        name={profile?.name ?? role}
        initials=""
        roleLabel={role}
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
          {managementLinks(profile?.role === role ? role : undefined).map(
            ({ href, icon, label }) => (
              <Link
                key={href}
                href={href}
                aria-label={label}
                title={collapsed ? label : undefined}
                aria-current={pathname === href ? "page" : undefined}
              >
                <Icon name={icon} />
                <span className={styles.sidebarLabel}>{label}</span>
              </Link>
            ),
          )}
        </nav>
      </aside>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
