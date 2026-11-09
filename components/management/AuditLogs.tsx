"use client";

import { useState } from "react";
import { auditCategories, useAuditLog } from "./audit-log";
import { ManagementMetrics } from "./ManagementMetrics";
import { ManagementShell } from "./ManagementShell";
import type { ManagementRole } from "./ManagementShell";
import { auditTimeZones, useManagementPreferences } from "./management-preferences";
import styles from "./management.module.css";

export function AuditLogs({ role }: { role: ManagementRole }) {
  const activity = useAuditLog();
  const { timeZone } = useManagementPreferences(role);
  const timeFormat = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium", timeStyle: "short", timeZone: timeZone === "local" ? undefined : timeZone,
  });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [outcome, setOutcome] = useState("All");
  const events = role === "Admin" ? activity.filter((entry) => entry.role === "Admin") : activity;
  const visible = events.filter((entry) =>
    `${entry.action} ${entry.target} ${entry.role}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (category === "All" || entry.category === category) &&
    (outcome === "All" || entry.outcome === outcome),
  );

  return (
    <ManagementShell role={role} active="Audit Logs" query={query} onQueryChange={setQuery} searchLabel="Search audit activity from the top bar">
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Audit Logs</p>
          <h1>Audit Logs</h1>
          <div className={styles.muted}>Review demo management activity recorded in this browser.</div>
        </div>
      </div>

      <ManagementMetrics metrics={[
        ["Recorded Events", events.length, "Recent management activity"],
        ["Successful", events.filter((entry) => entry.outcome === "Success").length, "Completed actions"],
        ["Failed", events.filter((entry) => entry.outcome === "Failed").length, "Actions that reported an error"],
      ]} />

      <section className={styles.card} aria-labelledby="audit-events">
        <h2 id="audit-events">Activity history</h2>
        <p className={styles.muted}>Time zone: {auditTimeZones[timeZone]}</p>
        <div className={`${styles.userFilters} ${styles.projectFilters}`}>
          <input type="search" aria-label="Search audit activity" placeholder="Search actions, targets, or roles..."
            value={query} onChange={(event) => setQuery(event.target.value)} />
          <label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>All</option>
            {auditCategories.map((item) => <option key={item}>{item}</option>)}
          </select></label>
          <label>Outcome<select value={outcome} onChange={(event) => setOutcome(event.target.value)}>
            <option>All</option><option>Success</option><option>Failed</option>
          </select></label>
          <button type="button" onClick={() => { setQuery(""); setCategory("All"); setOutcome("All"); }}>Reset</button>
        </div>
        <div className={styles.tableScroll}>
          <table className={`${styles.table} ${styles.userTable}`}>
            <thead><tr>{["Time", "Action", "Target", "Category", "Role", "Outcome"].map((label) =>
              <th key={label} scope="col">{label}</th>,
            )}</tr></thead>
            <tbody>
              {visible.map((entry) => (
                <tr key={entry.id}>
                  <td><time dateTime={entry.occurredAt}>{timeFormat.format(new Date(entry.occurredAt))}</time></td>
                  <th scope="row">{entry.action}</th>
                  <td>{entry.target}</td><td>{entry.category}</td><td>{entry.role}</td>
                  <td><span className={`${styles.badge} ${entry.outcome === "Success" ? styles.active : styles.error}`}>{entry.outcome}</span></td>
                </tr>
              ))}
              {!visible.length && <tr><td colSpan={6}>{events.length ? "No activity matches your filters." : "No activity recorded yet."}</td></tr>}
            </tbody>
          </table>
        </div>
        <p className={styles.tableSummary}>Showing {visible.length} of {events.length} recorded events</p>
      </section>
    </ManagementShell>
  );
}
