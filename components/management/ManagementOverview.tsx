"use client";

import Link from "next/link";
import { useState } from "react";
import { ManagementMetrics } from "./ManagementMetrics";
import {
  AdminSuperadminLayout,
  managementRoutes,
} from "./AdminSuperadminLayout";
import type { ManagementRole } from "./AdminSuperadminLayout";
import { getUserMetrics, useUsers } from "@/utils/user-store";
import { useDemoSession } from "@/utils/demo-session";
import { hasPermission, sectionPermissions } from "@/utils/permissions";
import { overview } from "@/data/overview";
import { getProjectMetrics } from "./project-metrics";
import { useAccessibleProjects } from "./project-storage";
import styles from "./management.module.css";

export function ManagementOverview({ role }: { role: ManagementRole }) {
  const [query, setQuery] = useState("");
  const projects = useAccessibleProjects();
  const { users } = useUsers();
  const { credential, access } = useDemoSession();
  const data = overview[role];
  const routes = managementRoutes[role];
  const links = data.links.filter(
    ([section, name, description]) =>
      hasPermission(credential?.role, access, sectionPermissions[section]) &&
      `${name} ${description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );

  return (
    <AdminSuperadminLayout
      role={role}
      active="Overview"
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search management shortcuts"
    >
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Overview</p>
          <h1>{role} Overview</h1>
          <div className={styles.muted}>{data.description}</div>
        </div>
      </div>
      <ManagementMetrics
        metrics={
          role === "Admin"
            ? getUserMetrics(users.filter((user) => user.role !== "Superadmin"))
            : getProjectMetrics(projects)
        }
      />
      <div className={styles.columns}>
        <section className={styles.card} aria-labelledby="management-shortcuts">
          <h2 id="management-shortcuts">Management shortcuts</h2>
          {links.length ? (
            <ul className={styles.overviewLinks}>
              {links.map(([section, name, description]) => (
                <li key={section}>
                  <Link href={routes[section]}>{name}</Link>
                  <p className={styles.muted}>{description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No shortcuts match your search.</p>
          )}
        </section>
        <section className={styles.card} aria-labelledby="needs-attention">
          <h2 id="needs-attention">Needs attention</h2>
          <h3>{data.attention}</h3>
          <p className={styles.muted}>
            {role === "Admin"
              ? users.filter((user) => user.status === "Pending").length +
                " accounts are awaiting activation."
              : projects.filter((project) => project.status === "Onboarding")
                  .length + " projects are onboarding."}
          </p>
          <div className={styles.overviewLinks}>
            {hasPermission(
              credential?.role,
              access,
              sectionPermissions[data.destination],
            ) && (
              <Link href={routes[data.destination]}>
                Review {data.destination.toLowerCase()}
              </Link>
            )}
          </div>
        </section>
      </div>
    </AdminSuperadminLayout>
  );
}
