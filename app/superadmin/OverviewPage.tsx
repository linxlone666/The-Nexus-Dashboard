"use client";

import Link from "next/link";
import { siteProjectId } from "@/data/management";
import { useDemoProjects } from "@/utils/project-storage";
import { useManagement } from "@/utils/management-store";

export default function OverviewPage() {
  const projects = useDemoProjects();
  const { accounts, sites, audit } = useManagement();
  const onboarding = sites.filter(
    (site) =>
      site.setupStatus === "onboarding" ||
      (!site.setupStatus && site.source?.kind === "rest"),
  );
  const issues = sites.filter((site) => site.source?.kind === "rest");
  const metrics = [
    {
      label: "Active accounts",
      value: accounts.filter(({ active }) => active).length,
      href: "/superadmin/users",
    },
    {
      label: "Active sites",
      value: sites.filter(({ active }) => active).length,
      href: "/superadmin/sites",
    },
    {
      label: "Onboarding in progress",
      value: onboarding.length,
      href: "#site-onboarding",
    },
    {
      label: "Awaiting connection",
      value: issues.length,
      href: "#integration-issues",
    },
    {
      label: "Recent audit events",
      value: audit.length,
      href: "/superadmin/audit-logs",
    },
  ];

  return (
    <main>
      <h1>Overview</h1>
      <p>Review accounts, work sites, and recent management activity.</p>
      <div className="superadmin-metrics">
        {metrics.map(({ label, value, href }) => (
          <Link className="superadmin-card" href={href} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </Link>
        ))}
      </div>
      <section className="superadmin-card">
        <h2>Projects</h2>
        <ul className="superadmin-event-list">
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.name}</strong>
              <span>
                {project.legacySiteCount +
                  sites.filter((site) => siteProjectId(site) === project.id)
                    .length}{" "}
                sites
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section className="superadmin-card" id="site-onboarding">
        <h2>Site onboarding</h2>
        {onboarding.length ? (
          <ul className="superadmin-event-list">
            {onboarding.map((site) => (
              <li key={site.id}>
                <Link
                  className="superadmin-text-link"
                  href={"/superadmin/sites#site-" + encodeURIComponent(site.id)}
                >
                  {site.name}
                </Link>
                <span>Waiting for data setup</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sites are being onboarded.</p>
        )}
      </section>
      <section className="superadmin-card" id="integration-issues">
        <h2>Awaiting connection</h2>
        {issues.length ? (
          <ul className="superadmin-event-list">
            {issues.map((site) => (
              <li key={site.id}>
                <Link
                  className="superadmin-text-link"
                  href={"/superadmin/sites#site-" + encodeURIComponent(site.id)}
                >
                  {site.name}
                </Link>
                <span>
                  REST endpoint configured. Live import is unavailable in the
                  demo.
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sites are waiting for an external connection.</p>
        )}
      </section>
      <section className="superadmin-card">
        <h2>Recent activity</h2>
        {audit.length ? (
          <ul className="superadmin-event-list">
            {audit.slice(0, 5).map(({ id, action, target }) => (
              <li key={id}>
                <strong>{action}</strong>
                <span>{target}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No management changes have been recorded yet.</p>
        )}
        <Link className="superadmin-text-link" href="/superadmin/audit-logs">
          Open audit logs
        </Link>
      </section>
    </main>
  );
}
