"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { InitializeSite } from "./InitializeSite";
import { getManagedSiteSystems } from "@/data/mock-system-data";
import { useDemoProjects } from "@/utils/project-storage";
import { siteProjectId, timeZones } from "@/data/management";
import { useDemoProfile } from "@/utils/demo-session";
import type { ManagedSite } from "@/data/management";
import {
  removeSite,
  saveSite,
  saveSitePreferences,
  useManagement,
} from "@/utils/management-store";
import "../directory.css";

function sourceLabel(site: ManagedSite) {
  if (site.source?.kind === "rest")
    return site.source.vendor || "REST API (configured)";
  return getManagedSiteSystems(site).length ? "Sample data" : "No dataset";
}

function SiteStatus({ active }: { active: boolean }) {
  return (
    <span className="directory-status" data-active={active}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function subscribeHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

export function SiteDirectory({ admin = false }: { admin?: boolean }) {
  const { sites: allSites, settings } = useManagement();
  const profile = useDemoProfile();
  const projects = useDemoProjects();
  const sites = admin
    ? allSites.filter((site) => profile?.siteIds.includes(site.id))
    : allSites;
  const path = admin ? "/admin/projects" : "/superadmin/sites";
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
  const linkedId = sites.find(
    (item) => hash === "#site-" + encodeURIComponent(item.id),
  )?.id;
  const [selection, setSelected] = useState<{
    id?: string;
    fromHash: string;
  }>();
  const selected = selection?.fromHash === hash ? selection.id : linkedId;
  const [confirmation, setConfirmation] = useState<{
    id: string;
    value: string;
  }>();
  const [initializing, setInitializing] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const site = sites.find(({ id }) => id === selected);
  const search = query.trim().toLowerCase();
  const visible = sites.filter((item) =>
    (item.name + " " + item.location).toLowerCase().includes(search),
  );
  const systems = site ? getManagedSiteSystems(site) : [];

  function selectSite(id?: string) {
    setSelected({ id, fromHash: hash });
    setConfirmation(undefined);
    setMessage("");
  }

  if (initializing && !admin) {
    return (
      <main>
        <InitializeSite
          onCancel={() => setInitializing(false)}
          onCreated={(id, name) => {
            setInitializing(false);
            const detailHash = "#site-" + encodeURIComponent(id);
            setSelected({ id, fromHash: detailHash });
            setQuery("");
            window.location.hash = detailHash;
            setMessage(name + " was created.");
          }}
        />
      </main>
    );
  }

  return (
    <main>
      <header className="directory-page-heading">
        <div>
          <p className="directory-breadcrumb">
            NEXUS / {admin ? "Admin" : "Superadmin"} / Sites
          </p>
          <h1>Sites</h1>
          <p className="superadmin-muted">
            {admin
              ? "View your assigned sites and update display preferences."
              : "Manage work sites and their demo data sources."}
          </p>
        </div>
        {!admin && (
          <button
            type="button"
            className="superadmin-button"
            onClick={() => {
              setMessage("");
              setInitializing(true);
            }}
          >
            + Add Site
          </button>
        )}
      </header>

      <div className="directory-workspace">
        <section
          className="superadmin-card directory-list"
          aria-labelledby="sites-title"
        >
          <h2 id="sites-title">Work sites</h2>
          <label className="superadmin-search">
            <span className="sr-only">Search sites</span>
            <input
              type="search"
              value={query}
              placeholder="Search sites…"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="superadmin-table-scroll">
            <table className="directory-table">
              <thead>
                <tr>
                  <th scope="col">Site</th>
                  <th scope="col">Location</th>
                  <th scope="col">Status</th>
                  <th scope="col">Data source</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr
                    key={item.id}
                    data-selected={selected === item.id}
                    onClick={() => selectSite(item.id)}
                  >
                    <td>
                      <button
                        type="button"
                        className="directory-name-button"
                        aria-current={selected === item.id ? "true" : undefined}
                      >
                        {item.name}
                      </button>
                      <span
                        className="directory-selected-label"
                        aria-hidden={selected !== item.id}
                      >
                        Selected
                      </span>
                    </td>
                    <td className="superadmin-muted">{item.location}</td>
                    <td>
                      <SiteStatus active={item.active} />
                    </td>
                    <td>{sourceLabel(item)}</td>
                  </tr>
                ))}
                {!visible.length && (
                  <tr>
                    <td colSpan={4}>No matching sites.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="directory-results">
            Showing {visible.length} of {sites.length} sites
          </p>
        </section>

        <section
          className="superadmin-card"
          id={site ? "site-" + encodeURIComponent(site.id) : undefined}
          aria-labelledby="site-form-title"
        >
          <div className="directory-details-heading">
            <h2 id="site-form-title">Site Details</h2>
            {site && (
              <button
                type="button"
                className="directory-more"
                aria-label="Close site details"
                onClick={() => selectSite()}
              >
                ×
              </button>
            )}
          </div>
          {site ? (
            <>
              <div className="directory-identity">
                <div>
                  <strong>{site.name}</strong>
                  <div>
                    <Link
                      href={path + "#site-" + encodeURIComponent(site.id)}
                      className="superadmin-text-link"
                    >
                      Link to site details
                    </Link>
                  </div>
                  <div className="superadmin-muted">{site.location}</div>
                </div>
                <SiteStatus active={site.active} />
              </div>
              <form
                key={site.id + site.name + site.location + site.active}
                className="superadmin-form directory-site-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const fields = new FormData(event.currentTarget);
                  try {
                    if (admin) {
                      saveSitePreferences(
                        site.id,
                        String(fields.get("name") ?? ""),
                        String(fields.get("timeZone") ?? ""),
                      );
                    } else
                      saveSite({
                        ...site,
                        name: String(fields.get("name") ?? ""),
                        location: String(fields.get("location") ?? ""),
                        active: fields.has("active"),
                      });
                    setMessage("Site updated.");
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Could not save this site.",
                    );
                  }
                }}
              >
                <label>
                  {admin ? "Display name" : "Site name"}
                  <input name="name" defaultValue={site.name} required />
                </label>
                {admin ? (
                  <label>
                    Time zone
                    <select
                      name="timeZone"
                      defaultValue={site.timeZone ?? settings.timeZone}
                    >
                      {timeZones.map((zone) => (
                        <option key={zone}>{zone}</option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <>
                    <label>
                      Location
                      <input
                        name="location"
                        defaultValue={site.location}
                        required
                      />
                    </label>
                    <label className="superadmin-checkbox">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={site.active}
                      />{" "}
                      Active
                    </label>
                  </>
                )}
                <dl className="directory-site-source">
                  <div>
                    <dt>Project</dt>
                    <dd>
                      {projects.find(
                        (project) => project.id === siteProjectId(site),
                      )?.name ?? siteProjectId(site)}
                    </dd>
                  </div>
                  <div>
                    <dt>Setup status</dt>
                    <dd>
                      {site.setupStatus === "onboarding" ||
                      (!site.setupStatus && site.source?.kind === "rest")
                        ? "Onboarding"
                        : "Ready"}
                    </dd>
                  </div>
                  <div>
                    <dt>Data source</dt>
                    <dd>{sourceLabel(site)}</dd>
                  </div>
                  <div>
                    <dt>Systems</dt>
                    <dd>
                      {systems.length
                        ? systems.map(({ name }) => name).join(", ")
                        : "None configured"}
                    </dd>
                  </div>
                </dl>
                <div className="superadmin-actions">
                  <button type="submit" className="superadmin-button">
                    Save changes
                  </button>
                  {!admin && (
                    <button
                      type="button"
                      className="superadmin-text-link"
                      onClick={() =>
                        setConfirmation({ id: site.id, value: "" })
                      }
                    >
                      Remove site
                    </button>
                  )}
                </div>
              </form>
              {!admin && confirmation?.id === site.id && (
                <form
                  className="superadmin-form directory-site-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    try {
                      removeSite(site.id, confirmation.value);
                      selectSite();
                      setMessage(site.name + " was removed.");
                    } catch (error) {
                      setMessage(
                        error instanceof Error
                          ? error.message
                          : "Could not remove this site.",
                      );
                    }
                  }}
                >
                  <h3>Remove {site.name}?</h3>
                  <p>
                    Users will lose dashboard access to this site. Its{" "}
                    {systems.length} configured systems will be disconnected
                    from the workspace. The parent project and sibling sites
                    will stay available.
                  </p>
                  <label>
                    Type {site.name} to confirm
                    <input
                      value={confirmation.value}
                      onChange={(event) =>
                        setConfirmation({
                          id: site.id,
                          value: event.target.value,
                        })
                      }
                    />
                  </label>
                  <div className="superadmin-actions">
                    <button
                      type="button"
                      onClick={() => setConfirmation(undefined)}
                    >
                      Cancel removal
                    </button>
                    <button
                      className="superadmin-button"
                      type="submit"
                      disabled={confirmation.value !== site.name}
                    >
                      Confirm removal
                    </button>
                  </div>
                </form>
              )}
            </>
          ) : (
            <>
              <p className="directory-summary-heading superadmin-muted">
                Select a site to view its source, systems, and settings.
              </p>
              <p className="superadmin-muted">
                {sites.filter(({ active }) => active).length} active sites ·{" "}
                {sites.filter(({ active }) => !active).length} inactive sites
              </p>
            </>
          )}
          {message && (
            <p className="superadmin-feedback" role="status">
              {message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
