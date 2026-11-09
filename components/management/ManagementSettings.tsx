"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { recordAuditActivity } from "./audit-log";
import { ManagementShell } from "./ManagementShell";
import type { ManagementRole } from "./ManagementShell";
import {
  auditTimeZones, defaultPreferences, saveManagementPreferences, useManagementPreferences,
} from "./management-preferences";
import styles from "./management.module.css";

export function ManagementSettings({ role }: { role: ManagementRole }) {
  const saved = useManagementPreferences(role);
  const [draft, setDraft] = useState<Partial<typeof defaultPreferences>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const preferences = { ...saved, ...draft };
  const dirty = preferences.density !== saved.density || preferences.timeZone !== saved.timeZone;

  function update(changes: Partial<typeof defaultPreferences>) {
    setDraft((current) => ({ ...current, ...changes }));
    setMessage("");
    setError("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;

    if (!saveManagementPreferences(role, preferences)) {
      setError("This browser could not save your preferences.");
      return;
    }
    recordAuditActivity({
      role, category: "Settings", action: "Display preferences updated", target: role, outcome: "Success",
    });
    setDraft({});
    setError("");
    setMessage("Preferences saved.");
  }

  return (
    <ManagementShell role={role} active="Settings" searchLabel="Search management">
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {role} / Settings</p>
          <h1>Settings</h1>
          <div className={styles.muted}>Choose how management pages display tables and audit timestamps.</div>
        </div>
      </div>

      <div className={styles.columns}>
        <section className={styles.card} aria-labelledby="preferences-heading">
          <h2 id="preferences-heading">Display preferences</h2>
          <form className={styles.settingsForm} onSubmit={save}>
            <label>
              <span>Table density</span>
              <select value={preferences.density} onChange={(event) => {
                update({ density: event.target.value === "compact" ? "compact" : "standard" });
              }}>
                <option value="standard">Standard</option><option value="compact">Compact</option>
              </select>
              <span className={styles.muted}>Compact spacing fits more rows in management tables.</span>
            </label>
            <label>
              <span>Audit log time zone</span>
              <select value={preferences.timeZone} onChange={(event) => {
                update({ timeZone: event.target.value as keyof typeof auditTimeZones });
              }}>
                {Object.entries(auditTimeZones).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
              <span className={styles.muted}>Controls how event times appear in Audit Logs.</span>
            </label>
            <div className={styles.actions}>
              <button type="button" onClick={() => update(defaultPreferences)}>Restore defaults</button>
              <button type="submit" className={styles.primary} disabled={!dirty}>Save preferences</button>
            </div>
            {message && <p className={styles.feedback} role="status">{message}</p>}
            {error && <p role="alert">{error}</p>}
          </form>
        </section>

        <aside className={styles.card} aria-labelledby="saved-preferences">
          <h2 id="saved-preferences">Saved preferences</h2>
          <p className={styles.muted}>These preferences apply to the {role} view in this browser.</p>
          <dl className={styles.settingsSummary}>
            <div><dt>Table density</dt><dd>{saved.density === "compact" ? "Compact" : "Standard"}</dd></div>
            <div><dt>Audit log time zone</dt><dd>{auditTimeZones[saved.timeZone]}</dd></div>
          </dl>
        </aside>
      </div>
    </ManagementShell>
  );
}
