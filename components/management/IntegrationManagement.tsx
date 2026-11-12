"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import Link from "next/link";
import { useState } from "react";
import { ManagementMetrics } from "./ManagementMetrics";
import {
  Icon,
  AdminSuperadminLayout,
  managementRoutes,
} from "./AdminSuperadminLayout";
import type { ManagementRole } from "./AdminSuperadminLayout";
import { useAccessibleProjects } from "./project-storage";
import { useDemoSession } from "@/utils/demo-session";
import { hasPermission } from "@/utils/permissions";
import { useVendors } from "./vendor-catalog";
import styles from "./management.module.css";

const statusColors = {
  Connected: "success",
  Disconnected: "gray",
  Error: "error",
  "Vendor unavailable": "warning",
  "Not configured": "gray",
} as const;

export function IntegrationManagement({ role }: { role: ManagementRole }) {
  const projects = useAccessibleProjects();
  const { credential, access } = useDemoSession();
  const vendors = useVendors();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [selectedKey, setSelectedKey] = useState<string | null>();
  const routes = managementRoutes[role];

  const integrations = projects.map((project) => {
    if (!("mappings" in project)) {
      return {
        project,
        vendorName: "",
        status: "Not configured",
        mappings: [],
      } as const;
    }

    // Projects saved before vendor IDs were recorded can still match their original name or endpoint.
    const vendor = project.vendorId
      ? vendors.find(({ id }) => id === project.vendorId)
      : (vendors.find(({ name }) => name === project.vendor) ??
        vendors.find(({ url }) => url === project.baseUrl));
    return {
      project,
      vendorName: vendor?.name ?? project.vendor,
      status: vendor?.status ?? "Vendor unavailable",
      mappings: project.mappings,
    } as const;
  });

  const visible = integrations.filter(
    (entry) =>
      `${entry.project.name} ${entry.project.organization} ${entry.vendorName}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (status === "All" || entry.status === status),
  );
  const selected =
    selectedKey === undefined
      ? visible[0]
      : visible.find(({ project }) => project.key === selectedKey);

  return (
    <AdminSuperadminLayout
      role={role}
      active="Integrations"
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search integrations from the top bar"
    >
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Integrations</p>
          <h1>Integrations</h1>
          <div className={styles.muted}>
            Review the vendors and data sources configured for each project.
          </div>
        </div>
        {hasPermission(credential?.role, access, "Access Projects") && (
          <Link className={styles.primary} href={routes.Projects}>
            View projects
          </Link>
        )}
      </div>

      <div className={styles.columns}>
        <div className={styles.userList}>
          <ManagementMetrics
            metrics={[
              [
                "Configured",
                integrations.filter(({ status }) => status !== "Not configured")
                  .length,
                "Projects with a vendor",
              ],
              [
                "Connected",
                integrations.filter(({ status }) => status === "Connected")
                  .length,
                "Providers marked connected",
              ],
              [
                "Needs attention",
                integrations.filter(
                  ({ status }) =>
                    status !== "Connected" && status !== "Not configured",
                ).length,
                "Configured providers unavailable",
              ],
              [
                "Mapped sources",
                integrations.reduce(
                  (count, { mappings }) => count + mappings.length,
                  0,
                ),
                "Sources across projects",
              ],
            ]}
          />

          <section
            className={styles.card}
            aria-labelledby="integrations-heading"
          >
            <h2 id="integrations-heading">Project integrations</h2>
            <div className={`${styles.userFilters} ${styles.vendorFilters}`}>
              <Input
                type="search"
                aria-label="Search integrations"
                placeholder="Search projects or vendors..."
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
                  {Object.keys(statusColors).map((item) => (
                    <option key={item}>{item}</option>
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
                      "Project",
                      "Organization",
                      "Vendor",
                      "Sources",
                      "Status",
                    ].map((label) => (
                      <th key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((entry) => (
                    <tr key={entry.project.key}>
                      <th scope="row">
                        <button
                          type="button"
                          className={styles.rowButton}
                          aria-pressed={
                            selected?.project.key === entry.project.key
                          }
                          onClick={() => setSelectedKey(entry.project.key)}
                        >
                          {entry.project.name}
                        </button>
                      </th>
                      <td>{entry.project.organization}</td>
                      <td>{entry.vendorName || "—"}</td>
                      <td>{entry.mappings.length}</td>
                      <td>
                        <Badge color={statusColors[entry.status]}>
                          {entry.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={5}>No integrations match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.tableSummary}>
              Showing {visible.length} of {integrations.length} projects
            </p>
          </section>
        </div>

        <aside className={styles.card} aria-labelledby="integration-details">
          <div className={styles.detailHeading}>
            <h2 id="integration-details">Integration Details</h2>
            {selected && (
              <button
                type="button"
                className={styles.rowButton}
                aria-label="Close integration details"
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
                  <Icon name="sliders" />
                </span>
                <div>
                  <h3>{selected.project.name}</h3>
                  <p className={styles.muted}>
                    {selected.project.organization}
                  </p>
                </div>
                <Badge
                  className="ml-auto"
                  color={statusColors[selected.status]}
                >
                  {selected.status}
                </Badge>
              </div>
              <div className={styles.record}>
                {selected.vendorName ? (
                  <p>Vendor: {selected.vendorName}</p>
                ) : (
                  <p>This project has no vendor configured.</p>
                )}
                {selected.mappings.length > 0 && (
                  <div className={styles.tableScroll}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th scope="col">Mapped source</th>
                          <th scope="col">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.mappings.map((mapping) => (
                          <tr key={mapping.source}>
                            <th scope="row">{mapping.name}</th>
                            <td>{mapping.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className={styles.overviewLinks}>
                {routes.Vendors &&
                  hasPermission(credential?.role, access, "Manage Vendors") &&
                  selected.vendorName && (
                    <Link href={routes.Vendors}>Manage vendors</Link>
                  )}
                {hasPermission(credential?.role, access, "Access Projects") && (
                  <Link href={routes.Projects}>View projects</Link>
                )}
              </div>
            </>
          ) : (
            <p className={styles.muted}>
              Select a project to see its integration details.
            </p>
          )}
        </aside>
      </div>
    </AdminSuperadminLayout>
  );
}
