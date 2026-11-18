import type { ReactNode } from "react";
import Link from "next/link";
import { Input } from "@/components/tailgrids/core/input";
import { ProfileMenu } from "./ProfileMenu";
import styles from "./TopBar.module.css";

type TopBarProps = {
  home: string;
  name: string;
  initials: string;
  roleLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  search?: ReactNode;
  workspace?: { site: string; dashboard: string };
};

export function TopBar({
  home,
  name,
  initials,
  roleLabel,
  searchLabel,
  searchPlaceholder,
  search,
  workspace,
}: TopBarProps) {
  return (
    <header className={styles.header}>
      <div className={styles.identity}>
        <Link className={styles.brand} href={home}>
          NEXUS
        </Link>
        {workspace && (
          <div className={styles.workspace}>
            <Link
              href="/login/sites?view=dashboard"
              className={styles.siteLink}
              title="Change work site"
            >
              {workspace.site}
            </Link>
            <span aria-hidden="true"> | </span>
            <span className={styles.dashboardName} title={workspace.dashboard}>
              {workspace.dashboard}
            </span>
          </div>
        )}
      </div>
      <div className={styles.headerActions}>
        {search ?? (
          <Input
            className={styles.headerSearch}
            type="search"
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            disabled
          />
        )}
        <svg
          className={styles.icon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <use href="/nexus-navigation.svg#bell" />
        </svg>
        <ProfileMenu name={name} initials={initials} roleLabel={roleLabel} />
      </div>
    </header>
  );
}
