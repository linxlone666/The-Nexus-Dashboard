"use client";

import { useState } from "react";
import { ManagementShell } from "./ManagementShell";
import styles from "./management.module.css";

const organizations = [
  { name: "Nexus Headquarters", status: "Active", detail: "6 sites", updated: "Today, 09:48" },
  { name: "North Campus", status: "Active", detail: "12 sites", updated: "Today, 08:30" },
  { name: "Riverside Properties", status: "Onboarding", detail: "Admin pending", updated: "Yesterday" },
] as const;

export function Organizations() {
  const [query, setQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [status, setStatus] = useState("All");
  const [selectedName, setSelectedName] = useState<string>(organizations[0].name);
  const [tab, setTab] = useState<"Details" | "History">("Details");
  const [expanded, setExpanded] = useState(false);

  const visible = organizations.filter((record) =>
    record.name.toLowerCase().includes(query.trim().toLowerCase()) &&
    (status === "All" || record.status === status),
  );
  const selected = visible.find((record) => record.name === selectedName) ?? visible[0];

  function selectRecord(name: string) {
    setSelectedName(name);
    setExpanded(false);
    setTab("Details");
  }

  return (
    <ManagementShell active="Projects" header={<span>SUPERADMIN / Nexus Headquarters</span>}>
      <div className={styles.heading}>
        <p>SUPERADMIN / ORGANIZATIONS &amp; PROJECTS</p>
        <h1>Organizations &amp; projects</h1>
      </div>

      <div className={`${styles.columns} ${styles.organizationColumns}`}>
        <section className={styles.card} aria-labelledby="organizations-heading">
          <h2 id="organizations-heading">Organizations &amp; projects</h2>
          <div className={styles.toolbar}>
            <input type="search" placeholder="Search..." aria-label="Search organizations"
              value={query} onChange={(event) => { setQuery(event.target.value); setExpanded(false); }} />
            <button type="button" aria-expanded={filterOpen} onClick={() => setFilterOpen(!filterOpen)}>Filter</button>
          </div>
          {filterOpen && (
            <label className={styles.filter}>Status
              <select value={status} onChange={(event) => { setStatus(event.target.value); setExpanded(false); }}>
                <option>All</option><option>Active</option><option>Onboarding</option>
              </select>
            </label>
          )}
          <table className={styles.table}>
            <thead><tr><th scope="col">Name / event</th><th scope="col">Status / details</th></tr></thead>
            <tbody>
              {visible.map((record) => (
                <tr key={record.name} className={selected?.name === record.name ? styles.selected : undefined}>
                  <th scope="row"><button type="button" className={styles.rowButton}
                    aria-pressed={selected?.name === record.name} onClick={() => selectRecord(record.name)}>
                    {record.name}
                  </button></th>
                  <td>{record.status} · {record.detail}</td>
                </tr>
              ))}
              {!visible.length && <tr><td colSpan={2}>No organizations match your filters.</td></tr>}
            </tbody>
          </table>
        </section>

        <aside className={styles.card} aria-labelledby="selected-record">
          <h2 id="selected-record">Selected record</h2>
          {selected ? (
            <>
              <h3>{selected.name}</h3>
              <p className={styles.muted}>{selected.status} · {selected.detail}</p>
              <div className={styles.tabs} aria-label="Record information">
                {(["Details", "History"] as const).map((name) => (
                  <button key={name} type="button" aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>
                ))}
              </div>
              {tab === "Details" ? (
                <div className={styles.record}>
                  <p>Scope: {selected.name}</p>
                  <p>Latest update: {selected.updated}</p>
                  {expanded && <p>Organization status: {selected.status} · {selected.detail}</p>}
                </div>
              ) : <p className={styles.record}>Record updated · {selected.updated}</p>}
              <button type="button" className={styles.primary} aria-expanded={expanded && tab === "Details"}
                onClick={() => { setTab("Details"); setExpanded(tab !== "Details" || !expanded); }}>
                {expanded && tab === "Details" ? "Hide details" : "View details"}
              </button>
            </>
          ) : <p className={styles.muted}>Select an organization to see its details.</p>}
        </aside>
      </div>
    </ManagementShell>
  );
}
