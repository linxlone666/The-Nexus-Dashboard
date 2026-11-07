"use client";

import { useState } from "react";
import { ManagementMetrics } from "./ManagementMetrics";
import { Icon, ManagementShell } from "./ManagementShell";
import type { ManagementRole } from "./ManagementShell";
import { organizations, projectMetrics, projects } from "./management-data";
import styles from "./management.module.css";

export function ProjectManagement({ role = "Superadmin" }: { role?: ManagementRole }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [organization, setOrganization] = useState("All");
  const [selectedName, setSelectedName] = useState<string | null>(projects[0].name);
  const [tab, setTab] = useState<"General" | "Activity">("General");

  const visible = projects.filter((project) =>
    `${project.name} ${project.organization}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (status === "All" || project.status === status) &&
    (organization === "All" || project.organization === organization),
  );
  const selected = visible.find((project) => project.name === selectedName);

  function openProject(name: string) {
    setSelectedName(name);
    setTab("General");
  }

  return (
    <ManagementShell role={role} active="Projects" query={query} onQueryChange={setQuery} searchLabel="Search projects from the top bar">
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Projects</p>
          <h1>Project Management</h1>
          <div className={styles.muted}>Browse projects, organizations, and onboarding status.</div>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.userList}>
          <ManagementMetrics metrics={projectMetrics} />
          <section className={styles.card} aria-labelledby="projects-heading">
            <h2 id="projects-heading">Projects</h2>
            <div className={`${styles.userFilters} ${styles.projectFilters}`}>
              <input type="search" placeholder="Search projects..." aria-label="Search projects"
                value={query} onChange={(event) => setQuery(event.target.value)} />
              <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>All</option><option>Active</option><option>Onboarding</option>
              </select></label>
              <label>Organization<select value={organization} onChange={(event) => setOrganization(event.target.value)}>
                <option>All</option>
                {organizations.map((name) => <option key={name}>{name}</option>)}
              </select></label>
              <button type="button" onClick={() => { setQuery(""); setStatus("All"); setOrganization("All"); }}>Reset</button>
            </div>
            <div className={styles.tableScroll}>
              <table className={`${styles.table} ${styles.userTable}`}>
                <thead><tr>
                  {["Name", "Organization", "Sites", "Status", "Last Updated", "Actions"].map((label) => (
                    <th key={label} scope="col">{label}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {visible.map((project) => (
                    <tr key={project.name}>
                      <th scope="row"><button type="button" className={styles.rowButton}
                        aria-pressed={selected?.name === project.name} onClick={() => openProject(project.name)}>
                        {project.name}
                      </button></th>
                      <td>{project.organization}</td>
                      <td>{project.sites ?? "—"}</td>
                      <td><span className={`${styles.badge} ${project.status === "Active" ? styles.active : styles.pending}`}>{project.status}</span></td>
                      <td>{project.updated}</td>
                      <td><button type="button" className={styles.rowButton} aria-label={`Details for ${project.name}`}
                        onClick={() => openProject(project.name)}>•••</button></td>
                    </tr>
                  ))}
                  {!visible.length && <tr><td colSpan={6}>No projects match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className={styles.tableSummary}>Showing {visible.length} of {projects.length} sample projects</p>
          </section>
        </div>

        <aside className={styles.card} aria-labelledby="project-details">
          <div className={styles.detailHeading}>
            <h2 id="project-details">Project Details</h2>
            {selected && <button type="button" className={styles.rowButton} aria-label="Close project details"
              onClick={() => setSelectedName(null)}><Icon name="close" /></button>}
          </div>
          {selected ? (
            <>
              <div className={styles.profile}>
                <span className={styles.avatar}><Icon name="grid" /></span>
                <div><h3>{selected.name}</h3><p className={styles.muted}>{selected.organization}</p></div>
                <span className={`${styles.badge} ${selected.status === "Active" ? styles.active : styles.pending}`}>{selected.status}</span>
              </div>
              <div className={styles.tabs} aria-label="Project information">
                {(["General", "Activity"] as const).map((name) => (
                  <button key={name} type="button" aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>
                ))}
              </div>
              {tab === "General" ? (
                <div className={styles.record}>
                  <p>Organization: {selected.organization}</p>
                  <p>{selected.sites === null ? "Site count pending" : `Connected sites: ${selected.sites}`}</p>
                  {selected.status === "Onboarding" && <p>Organization administrator pending.</p>}
                </div>
              ) : <p className={styles.record}>Record updated · {selected.updated}</p>}
            </>
          ) : <p className={styles.muted}>Select a project to see its details.</p>}
        </aside>
      </div>
    </ManagementShell>
  );
}
