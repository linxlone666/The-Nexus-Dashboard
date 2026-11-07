"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { recordAuditActivity } from "./audit-log";
import { ManagementMetrics } from "./ManagementMetrics";
import { Icon, ManagementShell } from "./ManagementShell";
import { parseVendorEndpoint, saveVendor, useVendors } from "./vendor-catalog";
import type { Vendor, VendorStatus } from "./vendor-catalog";
import styles from "./management.module.css";

const statuses = ["Connected", "Disconnected", "Error"] as const;
const statusStyles = { Connected: styles.active, Disconnected: styles.inactive, Error: styles.error };
const tabs = ["Overview", "Credentials", "Data Sources", "Sync & Logs"] as const;
type Tab = (typeof tabs)[number];

function Status({ value }: { value: VendorStatus }) {
  return <span className={`${styles.badge} ${statusStyles[value]}`}>{value}</span>;
}

export function VendorManagement() {
  const vendors = useVendors();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>("demo-security");
  const [tab, setTab] = useState<Tab>("Credentials");
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [formError, setFormError] = useState("");
  const [testError, setTestError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const [editorVersion, setEditorVersion] = useState(0);

  const selected = vendors.find(({ id }) => id === selectedId);
  const visible = vendors.filter((vendor) =>
    `${vendor.name} ${vendor.url}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (filter === "All" || filter === vendor.status),
  );
  const metrics = [
    ["Total Vendors", vendors.length, "All demo providers"],
    ["Connected", vendors.filter(({ status }) => status === "Connected").length, "Available providers"],
    ["Disconnected", vendors.filter(({ status }) => status === "Disconnected").length, "Awaiting connection"],
    ["Errors", vendors.filter(({ status }) => status === "Error").length, "Need attention"],
  ] as const;

  useEffect(() => {
    if (editorVersion) dialog.current?.showModal();
  }, [editorVersion]);

  function openEditor(vendor: Vendor | null) {
    setEditing(vendor);
    setEditorVersion((version) => version + 1);
    setFormError("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name")).trim();
    const endpoint = parseVendorEndpoint(String(fields.get("endpoint")));
    if (!name || !endpoint) {
      setFormError("Enter a vendor name and an HTTP or HTTPS base URL without credentials, query parameters, or fragments.");
      return;
    }
    const url = endpoint.href;
    const reference = String(fields.get("reference")).trim();
    const authentication = String(fields.get("authentication"));
    const sameConnection = editing?.url === url && editing.reference === reference && editing.authentication === authentication;
    const vendor: Vendor = {
      id: editing?.id ?? crypto.randomUUID(),
      name, url, authentication, reference,
      sources: editing?.sources ?? [],
      status: sameConnection ? editing.status : "Disconnected",
      lastSync: editing?.lastSync ?? "Never",
      testMessage: sameConnection ? editing.testMessage : undefined,
    };
    const error = saveVendor(vendor);
    if (error) {
      setFormError(error);
      return;
    }
    recordAuditActivity({
      role: "Superadmin", category: "Vendors", action: editing ? "Vendor updated" : "Vendor added",
      target: vendor.name, outcome: "Success",
    });
    dialog.current?.close();
    setSelectedId(vendor.id);
    setTab("Credentials");
    setQuery("");
    setFilter("All");
    setTestError("");
  }

  function testConnection(vendor: Vendor) {
    const passed = Boolean(parseVendorEndpoint(vendor.url) && vendor.reference);
    const error = saveVendor({
      ...vendor,
      status: passed ? "Connected" : "Error",
      testMessage: passed
        ? "Demo connection successful. Project setup can use this provider when sample sources are available."
        : "Demo connection failed. Check the endpoint and credential reference, then retry.",
    });
    recordAuditActivity({
      role: "Superadmin", category: "Vendors", action: "Demo connection tested",
      target: vendor.name, outcome: passed && !error ? "Success" : "Failed",
    });
    setTestError(error ?? "");
  }

  return (
    <ManagementShell role="Superadmin" active="Vendors" query={query} onQueryChange={setQuery} searchLabel="Search vendors from the top bar">
      <div className={styles.heading}>
        <div>
          <p>NEXUS / Superadmin / Vendors</p>
          <h1>Vendor Management</h1>
          <div className={styles.muted}>Manage external providers, credential references, and data sources.</div>
        </div>
        <button type="button" className={styles.primary} onClick={() => openEditor(null)}>+ Add Vendor</button>
      </div>

      <div className={styles.columns}>
        <div className={styles.userList}>
          <ManagementMetrics metrics={metrics} />
          <section className={styles.card} aria-labelledby="vendors-heading">
            <h2 id="vendors-heading">Vendors</h2>
            <div className={`${styles.userFilters} ${styles.vendorFilters}`}>
              <input type="search" aria-label="Search vendors" placeholder="Search vendors..." value={query}
                onChange={(event) => setQuery(event.target.value)} />
              <label>Connection status<select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}
              </select></label>
              <button type="button" onClick={() => { setQuery(""); setFilter("All"); }}>Reset</button>
            </div>
            <div className={styles.tableScroll}>
              <table className={`${styles.table} ${styles.userTable}`}>
                <thead><tr>{["Vendor name", "Type", "Data sources", "Status", "Last sync"].map((title) =>
                  <th key={title} scope="col">{title}</th>,
                )}</tr></thead>
                <tbody>
                  {visible.map((vendor) => (
                    <tr key={vendor.id}>
                      <th scope="row"><button type="button" className={styles.rowButton} aria-pressed={vendor.id === selectedId}
                        onClick={() => { setSelectedId(vendor.id); setTab("Credentials"); setTestError(""); }}>
                        {vendor.name}
                      </button></th>
                      <td>API</td><td>{vendor.sources.length}</td><td><Status value={vendor.status} /></td><td>{vendor.lastSync}</td>
                    </tr>
                  ))}
                  {!visible.length && <tr><td colSpan={5}>No vendors match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className={styles.tableSummary}>Showing {visible.length} of {vendors.length} demo vendors</p>
          </section>
        </div>

        <aside className={styles.card} aria-labelledby="vendor-details">
          <div className={styles.detailHeading}>
            <h2 id="vendor-details">Vendor Details</h2>
            {selected && <button type="button" className={styles.rowButton} aria-label="Close vendor details"
              onClick={() => setSelectedId(null)}><Icon name="close" /></button>}
          </div>
          {selected ? (
            <>
              <div className={styles.profile}>
                <span className={styles.avatar}><Icon name="grid" /></span>
                <div><h3>{selected.name}</h3><p className={styles.muted}>{parseVendorEndpoint(selected.url)?.hostname}</p></div>
                <Status value={selected.status} />
              </div>
              <div className={styles.tabs} aria-label="Vendor detail sections">
                {tabs.map((name) => <button key={name} type="button" aria-pressed={tab === name} onClick={() => setTab(name)}>{name}</button>)}
              </div>
              {tab === "Overview" && <div className={styles.record}>
                <p>{selected.sources.length} sample data sources</p><p>Last sync: {selected.lastSync}</p>
              </div>}
              {tab === "Credentials" && <div className={styles.record}>
                <p>Authentication: {selected.authentication}</p>
                <p>Credential reference: {selected.reference || "Not set"}</p>
                <p>Base URL: {selected.url}</p>
                <div><button type="button" onClick={() => openEditor(selected)}>Edit credentials</button></div>
              </div>}
              {tab === "Data Sources" && <div className={styles.record}>
                {selected.sources.length ? (
                  <ul>{selected.sources.map((source) => <li key={source.source}>{source.name} · {source.type || "Unmapped"}</li>)}</ul>
                ) : <p>No sample data sources are available for this vendor.</p>}
                <p>Map vendor sources during project setup.</p>
              </div>}
              {tab === "Sync & Logs" && <div className={styles.record}>
                <p>Last sync: {selected.lastSync}</p>
                <p>{selected.testMessage || "No demo connection test recorded."}</p>
              </div>}
              <h3>Connection test</h3>
              <p className={styles.muted}>Simulate a check of the saved endpoint and credential reference.</p>
              <div className={styles.vendorTest}>
                <button type="button" className={styles.primary} onClick={() => testConnection(selected)}>
                  {selected.status === "Error" ? "Retry demo test" : "Test demo connection"}
                </button>
                <p role="status" className={styles.feedback}>{selected.testMessage}</p>
                {testError && <p role="alert">{testError}</p>}
              </div>
            </>
          ) : <p className={styles.muted}>Select a vendor to see its details.</p>}
        </aside>
      </div>

      <dialog className={styles.dialog} ref={dialog} aria-labelledby="vendor-editor">
        <form key={editorVersion} onSubmit={submit}>
          <h2 id="vendor-editor">{editing ? "Edit vendor" : "Add vendor"}</h2>
          <label>Vendor name<input name="name" required maxLength={60} defaultValue={editing?.name} /></label>
          <label>Base URL<input name="endpoint" type="url" required placeholder="https://api.example.com" defaultValue={editing?.url} /></label>
          <label>Authentication<select name="authentication" defaultValue={editing?.authentication ?? "API key"}>
            <option>API key</option><option>Bearer token</option>
          </select></label>
          <label>Credential reference<input name="reference" maxLength={100} defaultValue={editing?.reference} /></label>
          <p className={styles.muted}>Enter a credential name or ID. Keep the actual secret in your credential store.</p>
          {formError && <p role="alert">{formError}</p>}
          <div className={styles.actions}>
            <button type="button" onClick={() => dialog.current?.close()}>Cancel</button>
            <button type="submit" className={styles.primary}>{editing ? "Save vendor" : "Add vendor"}</button>
          </div>
        </form>
      </dialog>
    </ManagementShell>
  );
}
