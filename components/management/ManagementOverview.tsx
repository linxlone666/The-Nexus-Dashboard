"use client";

import Link from "next/link";
import { useState } from "react";
import { ManagementMetrics } from "./ManagementMetrics";
import { ManagementShell, managementRoutes } from "./ManagementShell";
import type { ManagementRole } from "./ManagementShell";
import { getProjectMetrics, userMetrics } from "./management-data";
import { useProjects } from "./project-storage";
import styles from "./management.module.css";

const overview = {
  Admin: {
    description: "Monitor user access and manage projects in your workspace.",
    links: [
      ["Users", "User Management", "Review accounts, roles, and permissions."],
      ["Projects", "Project Management", "Review project status in your workspace."],
    ],
    attention: "Access requests awaiting review",
    detail: "10 requests are pending in the sample workspace.",
    destination: "Users",
  },
  Superadmin: {
    description: "Monitor organizations, project onboarding, and administration across the platform.",
    links: [
      ["Projects", "Project Management", "Review organizations and project onboarding."],
      ["Users", "User Management", "Review user access across organizations."],
    ],
    attention: "Project onboarding awaiting an administrator",
    detail: "Riverside Properties has one project in onboarding.",
    destination: "Projects",
  },
} as const;

export function ManagementOverview({ role }: { role: ManagementRole }) {
  const [query, setQuery] = useState("");
  const projects = useProjects();
  const data = overview[role];
  const routes = managementRoutes[role];
  const links = data.links.filter(([, name, description]) =>
    `${name} ${description}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <ManagementShell role={role} active="Overview" query={query} onQueryChange={setQuery} searchLabel="Search management shortcuts">
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Overview</p>
          <h1>{role} Overview</h1>
          <div className={styles.muted}>{data.description}</div>
        </div>
      </div>
      <ManagementMetrics metrics={role === "Admin" ? userMetrics : getProjectMetrics(projects)} />
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
          ) : <p className={styles.muted}>No shortcuts match your search.</p>}
        </section>
        <section className={styles.card} aria-labelledby="needs-attention">
          <h2 id="needs-attention">Needs attention</h2>
          <h3>{data.attention}</h3>
          <p className={styles.muted}>{data.detail}</p>
          <div className={styles.overviewLinks}><Link href={routes[data.destination]}>Review {data.destination.toLowerCase()}</Link></div>
        </section>
      </div>
    </ManagementShell>
  );
}
