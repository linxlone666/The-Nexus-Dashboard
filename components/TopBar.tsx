import type { ReactNode } from "react";
import Link from "next/link";
import { ProfileMenu } from "./ProfileMenu";
import styles from "./TopBar.module.css";

type TopBarProps = {
  home: string;
  name: string;
  initials: string;
  roleLabel: string;
  workspace?: { site: string; dashboard: string; sitePicker?: ReactNode };
};

export function TopBar({
  home,
  name,
  initials,
  roleLabel,
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
            {workspace.sitePicker ?? <Link
              href="/login/sites?view=dashboard"
              className={styles.siteLink}
              title="Change work site"
            >
              {workspace.site}
            </Link>}
            <span aria-hidden="true"> | </span>
            <span className={styles.dashboardName} title={workspace.dashboard}>
              {workspace.dashboard}
            </span>
          </div>
        )}
      </div>
      <div className={styles.headerActions}>
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
