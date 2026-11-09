"use client";

import Link from "next/link";
import { useState } from "react";
import { ManagementMetrics } from "./ManagementMetrics";
import { Icon, ManagementShell, managementRoutes } from "./ManagementShell";
import type { ManagementRole } from "./ManagementShell";
import { useProjects } from "./project-storage";
import { useVendors } from "./vendor-catalog";
import styles from "./management.module.css";

const statusStyles = {
  Connected: styles.active,
  Disconnected: styles.inactive,
  Error: styles.error,
  "Vendor unavailable": styles.pending,
  "Not configured": styles.inactive,
};

export function IntegrationManagement({ role }: { role: ManagementRole }) {
  const projects = useProjects();
  const vendors = useVendors();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedKey, setSelectedKey] = useState<string | null>();
  const routes = managementRoutes[role];

  const integrations = projects.map((project) => {
    if (!("mappings" in project)) {
      return { project, vendorName: "", status: "Not configured", mappings: [] } as const;
    }

    // Projects saved before vendor IDs were recorded can still match their original name or endpoint.
    const vendor = project.vendorId
      ? vendors.find(({ id }) => id === project.vendorId)
      : vendors.find(({ name }) => name === project.vendor) ??
        vendors.find(({ url }) => url === project.baseUrl);
    return {
      project,
      vendorName: vendor?.name ?? project.vendor,
      status: vendor?.status ?? "Vendor unavailable",
      mappings: project.mappings,
    } as const;
  });

  const visible = integrations.filter((entry) =>
    `${entry.project.name} ${entry.project.organization} ${entry.vendorName}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (status === "All" || entry.status === status),
  );
  const selected = selectedKey === undefined ? visible[0] : visible.find(({ project }) => project.key === selectedKey);

  return (
    <ManagementShell role={role} active="Integrations" query={query} onQueryChange={setQuery}
      searchLabel="Search integrations from the top bar">
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Integrations</p>
          <h1>Integrations</h1>
          <div className={styles.muted}>Review the vendors and data sources configured for each project.</div>
        </div>
        <Link className={styles.primary} href={routes.Projects}>View projects</Link>
      </div>

      <div className={styles.columns}>
        <div className={styles.userList}>
          <ManagementMetrics metrics={[
            ["Configured", integrations.filter(({ status }) => status !== "Not configured").length, "Projects with a vendor"],
            ["Connected", integrations.filter(({ status }) => status === "Connected").length, "Providers marked connected"],
            ["Needs attention", integrations.filter(({ status }) =>
              status !== "Connected" && status !== "Not configured").length, "Configured providers unavailable"],
            ["Mapped sources", integrations.reduce((count, { mappings }) => count + mappings.length, 0), "Sources across projects"],
          ]} />

          <section className={styles.card} aria-labelledby="integrations-heading">
            <h2 id="integrations-heading">Project integrations</h2>
            <div className={`${styles.userFilters} ${styles.vendorFilters}`}>
              <input type="search" aria-label="Search integrations" placeholder="Search projects or vendors..."
                value={query} onChange={(event) => setQuery(event.target.value)} />
              <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>All</option>
                {Object.keys(statusStyles).map((item) => <option key={item}>{item}</option>)}
              </select></label>
              <button type="button" onClick={() => { setQuery(""); setStatus("All"); }}>Reset</button>
            </div>
            <div className={styles.tableScroll}>
              <table className={`${styles.table} ${styles.userTable}`}>
                <thead><tr>{["Project", "Organization", "Vendor", "Sources", "Status"].map((label) =>
                  <th key={label} scope="col">{label}</th>,
                )}</tr></thead>
                <tbody>
                  {visible.map((entry) => (
                    <tr key={entry.project.key}>
                      <th scope="row"><button type="button" className={styles.rowButton}
                        aria-pressed={selected?.project.key === entry.project.key}
                        onClick={() => setSelectedKey(entry.project.key)}>{entry.project.name}</button></th>
                      <td>{entry.project.organization}</td><td>{entry.vendorName || "—"}</td><td>{entry.mappings.length}</td>
                      <td><span className={`${styles.badge} ${statusStyles[entry.status]}`}>{entry.status}</span></td>
                    </tr>
                  ))}
                  {!visible.length && <tr><td colSpan={5}>No integrations match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className={styles.tableSummary}>Showing {visible.length} of {integrations.length} projects</p>
          </section>
        </div>

        <aside className={styles.card} aria-labelledby="integration-details">
          <div className={styles.detailHeading}>
            <h2 id="integration-details">Integration Details</h2>
            {selected && <button type="button" className={styles.rowButton} aria-label="Close integration details"
              onClick={() => setSelectedKey(null)}><Icon name="close" /></button>}
          </div>
          {selected ? (
            <>
              <div className={styles.profile}>
                <span className={styles.avatar}><Icon name="sliders" /></span>
                <div><h3>{selected.project.name}</h3><p className={styles.muted}>{selected.project.organization}</p></div>
                <span className={`${styles.badge} ${statusStyles[selected.status]}`}>{selected.status}</span>
              </div>
              <div className={styles.record}>
                {selected.vendorName ? <p>Vendor: {selected.vendorName}</p> : <p>This project has no vendor configured.</p>}
                {selected.mappings.length > 0 && (
                  <div className={styles.tableScroll}>
                    <table className={styles.table}>
                      <thead><tr><th scope="col">Mapped source</th><th scope="col">Type</th></tr></thead>
                      <tbody>{selected.mappings.map((mapping) => (
                        <tr key={mapping.source}>
                          <th scope="row">{mapping.name}</th><td>{mapping.type}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className={styles.overviewLinks}>
                {routes.Vendors && selected.vendorName && <Link href={routes.Vendors}>Manage vendors</Link>}
                <Link href={routes.Projects}>View projects</Link>
              </div>
            </>
          ) : <p className={styles.muted}>Select a project to see its integration details.</p>}
        </aside>
      </div>
    </ManagementShell>
  );
}
