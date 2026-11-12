"use client";

import { ProjectDescriptionEditor } from "@/components/ProjectDescriptionEditor";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import Link from "next/link";
import { useState } from "react";
import { ManagementMetrics } from "./ManagementMetrics";
import { Icon, AdminSuperadminLayout } from "./AdminSuperadminLayout";
import type { ManagementRole } from "./AdminSuperadminLayout";
import { organizations } from "@/data/projects";
import { getProjectMetrics } from "./project-metrics";
import { useAccessibleProjects } from "./project-storage";
import styles from "./management.module.css";

export function ProjectManagement({
  role = "Superadmin",
}: {
  role?: ManagementRole;
}) {
  const projects = useAccessibleProjects();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [organization, setOrganization] = useState("All");
  const [selectedKey, setSelectedKey] = useState<string | null>();
  const [tab, setTab] = useState<"General" | "Activity">("General");

  const visible = projects.filter(
    (project) =>
      `${project.name} ${project.organization}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (status === "All" || project.status === status) &&
      (organization === "All" || project.organization === organization),
  );
  const selected =
    selectedKey === undefined
      ? visible[0]
      : visible.find((project) => project.key === selectedKey);

  function openProject(key: string) {
    setSelectedKey(key);
    setTab("General");
  }

  return (
    <AdminSuperadminLayout
      role={role}
      active="Projects"
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search projects from the top bar"
    >
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Projects</p>
          <h1>Project Management</h1>
          <div className={styles.muted}>
            Browse projects, organizations, and onboarding status.
          </div>
        </div>
        {role === "Superadmin" && (
          <Link
            className={styles.primary}
            href="/superadmin/projects/initialize"
          >
            + Initialize New Project
          </Link>
        )}
      </div>

      <div className={styles.columns}>
        <div className={styles.userList}>
          <ManagementMetrics metrics={getProjectMetrics(projects)} />
          <section className={styles.card} aria-labelledby="projects-heading">
            <h2 id="projects-heading">Projects</h2>
            <div className={`${styles.userFilters} ${styles.projectFilters}`}>
              <Input
                type="search"
                placeholder="Search projects..."
                aria-label="Search projects"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <label>
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Onboarding</option>
                </select>
              </label>
              <label>
                Organization
                <select
                  value={organization}
                  onChange={(event) => setOrganization(event.target.value)}
                >
                  <option>All</option>
                  {organizations.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              <Button
                size="xs"
                appearance="outline"
                type="button"
                onPress={() => {
                  setQuery("");
                  setStatus("All");
                  setOrganization("All");
                }}
              >
                Reset
              </Button>
            </div>
            <div className={styles.tableScroll}>
              <table className={`${styles.table} ${styles.userTable}`}>
                <thead>
                  <tr>
                    {[
                      "Name",
                      "Organization",
                      "Sites",
                      "Status",
                      "Last Updated",
                      "Actions",
                    ].map((label) => (
                      <th key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((project) => (
                    <tr key={project.key}>
                      <th scope="row">
                        <button
                          type="button"
                          className={styles.rowButton}
                          aria-pressed={selected?.key === project.key}
                          onClick={() => openProject(project.key)}
                        >
                          {project.name}
                        </button>
                      </th>
                      <td>{project.organization}</td>
                      <td>{project.sites ?? "—"}</td>
                      <td>
                        <Badge
                          color={
                            project.status === "Active" ? "success" : "warning"
                          }
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td>{project.updated}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.rowButton}
                          aria-label={`Details for ${project.name}`}
                          onClick={() => openProject(project.key)}
                        >
                          •••
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={6}>No projects match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.tableSummary}>
              Showing {visible.length} of {projects.length} sample projects
            </p>
          </section>
        </div>

        <aside className={styles.card} aria-labelledby="project-details">
          <div className={styles.detailHeading}>
            <h2 id="project-details">Project Details</h2>
            {selected && (
              <button
                type="button"
                className={styles.rowButton}
                aria-label="Close project details"
                onClick={() => setSelectedKey(null)}
              >
                <Icon name="close" />
              </button>
            )}
          </div>
          {selected ? (
            <>
              <div className={styles.profile}>
                <span className={styles.avatar}>
                  <Icon name="grid" />
                </span>
                <div>
                  <h3>{selected.name}</h3>
                  <p className={styles.muted}>{selected.organization}</p>
                </div>
                <Badge
                  className="ml-auto"
                  color={selected.status === "Active" ? "success" : "warning"}
                >
                  {selected.status}
                </Badge>
              </div>
              <div className={styles.tabs} aria-label="Project information">
                {(["General", "Activity"] as const).map((name) => (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={tab === name}
                    onClick={() => setTab(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {tab === "General" ? (
                <div className={styles.record}>
                  <p>Organization: {selected.organization}</p>
                  <p>
                    {selected.sites === null
                      ? "Site count pending"
                      : `Connected sites: ${selected.sites}`}
                  </p>
                  {"mappings" in selected ? (
                    <>
                      <p>Project key: {selected.key}</p>
                      <p>Environment: {selected.environment}</p>
                      <p>Owner: {selected.owner}</p>
                      <p>
                        Vendor: {selected.vendor} · {selected.mappings.length}{" "}
                        mapped sources
                      </p>
                    </>
                  ) : (
                    selected.status === "Onboarding" && (
                      <p>Organization administrator pending.</p>
                    )
                  )}
                  <ProjectDescriptionEditor
                    key={selected.key}
                    project={selected}
                  />
                </div>
              ) : (
                <p className={styles.record}>
                  Record updated · {selected.updated}
                </p>
              )}
            </>
          ) : (
            <p className={styles.muted}>Select a project to see its details.</p>
          )}
        </aside>
      </div>
    </AdminSuperadminLayout>
  );
}
