"use client";

import { getManagedSiteSystems } from "@/data/mock-system-data";
import { useState } from "react";
import { bootstrapEmail, roles } from "@/data/management";
import type {
  DemoAccount,
  ManagementRole,
  ManagedSite,
} from "@/data/management";
import { useDemoProfile } from "@/utils/demo-session";
import {
  saveAccount,
  saveStandardUserAccess,
  useManagement,
} from "@/utils/management-store";
import "@/app/superadmin/directory.css";

const sections = ["General", "Permissions", "Activity"] as const;
type Section = (typeof sections)[number];

function siteCount(user: DemoAccount, sites: ManagedSite[]) {
  return sites.filter(
    (site) =>
      site.active &&
      (user.role === "Superadmin" || user.siteIds.includes(site.id)),
  ).length;
}

function Status({ active }: { active: boolean }) {
  return (
    <span className="directory-status" data-active={active}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function UserManagement({
  manager,
}: {
  manager: "Admin" | "Superadmin";
}) {
  const admin = manager === "Admin";
  const profile = useDemoProfile();
  const {
    accounts: allAccounts,
    sites: allSites,
    audit,
    settings,
  } = useManagement();
  const accounts = admin
    ? allAccounts.filter((account) => account.role === "User")
    : allAccounts;
  const sites = admin
    ? allSites.filter((site) => profile?.siteIds.includes(site.id))
    : allSites;
  const roleOptions = admin ? ["User"] : roles;
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [siteId, setSiteId] = useState("");
  const [panel, setPanel] = useState<string | null>(
    admin ? null : bootstrapEmail,
  );
  const [section, setSection] = useState<Section>("General");
  const [checked, setChecked] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const account = accounts.find(({ email }) => email === panel);
  const activeCount = accounts.filter(({ active }) => active).length;
  const time = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: settings.timeZone,
  });
  const search = query.trim().toLowerCase();
  const visible = accounts.filter(
    (user) =>
      [user.name, user.email].some((value) =>
        value.toLowerCase().includes(search),
      ) &&
      (!role || user.role === role) &&
      (!status || user.active === (status === "active")) &&
      (!siteId ||
        siteCount(
          user,
          sites.filter(({ id }) => id === siteId),
        ) > 0),
  );
  const allVisibleChecked =
    visible.length > 0 && visible.every(({ email }) => checked.includes(email));
  const metrics = [
    {
      label: "Total Users",
      count: accounts.length,
      detail: "Registered accounts",
    },
    {
      label: "Active Users",
      count: activeCount,
      detail: "Accounts with sign-in access",
    },
    {
      label: "Inactive Users",
      count: accounts.length - activeCount,
      detail: "Sign-in disabled",
    },
    {
      label: "Users with Site Access",
      count: accounts.filter((user) => user.active && siteCount(user, sites))
        .length,
      detail: "Assigned to at least one active site",
    },
  ];

  function openPanel(email: string | null) {
    setPanel(email);
    setSection("General");
    setMessage("");
  }

  function exportUsers() {
    const rows = checked.length
      ? accounts.filter(({ email }) => checked.includes(email))
      : visible;
    const csvField = (value: string | number) => {
      const text = String(value);
      const safe =
        /^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)
          ? "'" + text
          : text;
      return '"' + safe.replaceAll('"', '""') + '"';
    };
    const lines = [
      ["Name", "Email", "Role", "Active sites", "Status", "Last active"],
      ...rows.map((user) => [
        user.name,
        user.email,
        user.role,
        siteCount(user, sites),
        user.active ? "Active" : "Inactive",
        user.lastSignIn ?? "",
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob([lines.map((row) => row.map(csvField).join(",")).join("\r\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexus-users.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <main className="directory-page">
      <header className="directory-page-heading">
        <div>
          <p className="directory-breadcrumb">NEXUS / {manager} / Users</p>
          <h1>User Management</h1>
          <p className="superadmin-muted">
            {admin
              ? "Manage standard users’ site and monitoring access."
              : "Manage user accounts, roles, permissions and site access."}
          </p>
        </div>
        <div className="superadmin-actions">
          <button
            type="button"
            className="directory-secondary-button"
            onClick={exportUsers}
          >
            Export users{checked.length ? " (" + checked.length + ")" : ""}
          </button>
          {!admin && (
            <button
              type="button"
              className="superadmin-button"
              onClick={() => openPanel("new")}
            >
              + Add User
            </button>
          )}
        </div>
      </header>

      {message && (
        <p className="superadmin-feedback" role="status">
          {message}
        </p>
      )}

      <div className="directory-workspace">
        <div className="directory-list">
          <div className="directory-metrics">
            {metrics.map(({ label, count, detail }) => (
              <div className="superadmin-card" key={label}>
                <span>{label}</span>
                <strong>{count}</strong>
                <small>{detail}</small>
              </div>
            ))}
          </div>

          <section className="superadmin-card" aria-labelledby="users-title">
            <h2 id="users-title">Users</h2>
            <div className="directory-filters">
              <label className="superadmin-search">
                <span className="sr-only">Search users</span>
                <input
                  type="search"
                  placeholder="Search users…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="superadmin-search">
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option value="">All</option>
                  {roleOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="superadmin-search">
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="superadmin-search">
                Site Access
                <select
                  value={siteId}
                  onChange={(event) => setSiteId(event.target.value)}
                >
                  <option value="">All</option>
                  {sites
                    .filter(({ active }) => active)
                    .map(({ id, name }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                </select>
              </label>
              <button
                type="button"
                className="directory-secondary-button"
                onClick={() => {
                  setQuery("");
                  setRole("");
                  setStatus("");
                  setSiteId("");
                  setChecked([]);
                }}
              >
                Reset
              </button>
            </div>
            <div className="superadmin-table-scroll">
              <table className="directory-table">
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        type="checkbox"
                        aria-label="Select all matching users"
                        checked={allVisibleChecked}
                        disabled={!visible.length}
                        onChange={() => {
                          const emails = visible.map(({ email }) => email);
                          setChecked((current) =>
                            allVisibleChecked
                              ? current.filter(
                                  (email) => !emails.includes(email),
                                )
                              : [...new Set([...current, ...emails])],
                          );
                        }}
                      />
                    </th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Site Access</th>
                    <th scope="col">Status</th>
                    <th scope="col">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((user) => (
                    <tr
                      key={user.email}
                      data-selected={account?.email === user.email}
                      onClick={() => openPanel(user.email)}
                    >
                      <td onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={"Select " + user.name}
                          checked={checked.includes(user.email)}
                          onChange={() =>
                            setChecked((current) =>
                              current.includes(user.email)
                                ? current.filter(
                                    (email) => email !== user.email,
                                  )
                                : [...current, user.email],
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="directory-name-button"
                          aria-current={
                            account?.email === user.email ? "true" : undefined
                          }
                        >
                          {user.name}
                        </button>
                        <span
                          className="directory-selected-label"
                          aria-hidden={account?.email !== user.email}
                        >
                          Selected
                        </span>
                      </td>
                      <td className="superadmin-muted">{user.email}</td>
                      <td>
                        <span className="directory-role">{user.role}</span>
                      </td>
                      <td>{siteCount(user, sites)} site(s)</td>
                      <td>
                        <Status active={user.active} />
                      </td>
                      <td>
                        {user.lastSignIn ? (
                          <time dateTime={user.lastSignIn}>
                            {time.format(new Date(user.lastSignIn))}
                          </time>
                        ) : (
                          "Never"
                        )}
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={7}>No matching accounts.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="directory-results">
              Showing {visible.length} of {accounts.length} users
            </p>
          </section>
        </div>

        {panel !== null && (
          <section
            className="superadmin-card directory-details"
            aria-labelledby="user-details-title"
          >
            <div className="directory-details-heading">
              <h2 id="user-details-title">
                {account ? "User Details" : "Add User"}
              </h2>
              <button
                type="button"
                className="directory-more"
                aria-label="Close user details"
                onClick={() => openPanel(null)}
              >
                ×
              </button>
            </div>

            {account && (
              <div className="directory-identity">
                <span className="directory-avatar" aria-hidden="true">
                  {account.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <div>
                  <strong>{account.name}</strong>
                  <div className="superadmin-muted">{account.email}</div>
                </div>
                <Status active={account.active} />
              </div>
            )}

            <div
              className="directory-sections"
              aria-label="User details sections"
            >
              {(account ? sections : (["General", "Permissions"] as const)).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={item === section}
                    onClick={() => {
                      setSection(item);
                      setMessage("");
                    }}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>

            <form
              key={account?.email ?? "new"}
              noValidate
              className="superadmin-form"
              onSubmit={(event) => {
                event.preventDefault();
                const fields = new FormData(event.currentTarget);
                const value = (key: string) => String(fields.get(key) ?? "");
                const siteIds = fields.getAll("site").map(String);
                const systemsBySite = Object.fromEntries(
                  sites.flatMap((site) => {
                    if (!siteIds.includes(site.id)) return [];
                    const configured = getManagedSiteSystems(site);
                    const selected = configured
                      .filter((system) =>
                        fields.getAll("system:" + site.id).includes(system.id),
                      )
                      .map((system) => system.id);
                    return selected.length === configured.length &&
                      account?.systemsBySite?.[site.id] === undefined
                      ? []
                      : [[site.id, selected]];
                  }),
                );
                if (admin && account) {
                  try {
                    saveStandardUserAccess(
                      account.email,
                      siteIds,
                      systemsBySite,
                    );
                    setMessage("Site and monitoring access saved.");
                  } catch (error) {
                    setMessage(
                      error instanceof Error
                        ? error.message
                        : "Could not save access.",
                    );
                  }
                  return;
                }
                const input: DemoAccount = {
                  name: value("name"),
                  email: value("email"),
                  role: value("role") as ManagementRole,
                  password: value("password"),
                  active: fields.has("active"),
                  siteIds,
                  systemsBySite,
                };

                try {
                  saveAccount(input, account?.email);
                  if (!account) setPanel(input.email.trim().toLowerCase());
                  const password = event.currentTarget.elements.namedItem(
                    "password",
                  ) as HTMLInputElement | null;
                  if (password) password.value = "";
                  setMessage(account ? "Account updated." : "Account created.");
                } catch (error) {
                  if (
                    !input.name.trim() ||
                    !input.email.trim() ||
                    (!account && input.password.length < 4)
                  )
                    setSection("General");
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Could not save this account.",
                  );
                }
              }}
            >
              <div className="directory-fields" hidden={section !== "General"}>
                <label>
                  Name
                  <input
                    name="name"
                    defaultValue={account?.name}
                    readOnly={admin}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    type="email"
                    name="email"
                    defaultValue={account?.email}
                    readOnly={Boolean(account)}
                    required
                  />
                </label>
                {!admin && (
                  <label>
                    {account ? "New demo password (optional)" : "Demo password"}
                    <input
                      type="password"
                      autoComplete="new-password"
                      name="password"
                      minLength={4}
                      required={!account}
                    />
                  </label>
                )}
                <label className="superadmin-checkbox">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={account?.active ?? true}
                    disabled={admin}
                  />{" "}
                  Active
                </label>
              </div>

              <div
                className="directory-fields"
                hidden={section !== "Permissions"}
              >
                {!admin && (
                  <label>
                    Role
                    <select name="role" defaultValue={account?.role ?? "User"}>
                      {roles.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>
                )}
                <fieldset>
                  <legend>Site Access</legend>
                  <p className="superadmin-muted">
                    {admin
                      ? "Only sites assigned to you are listed."
                      : "Superadmin can access all active sites."}
                  </p>
                  {sites.map((site) => (
                    <label key={site.id} className="superadmin-checkbox">
                      <input
                        type="checkbox"
                        name="site"
                        value={site.id}
                        defaultChecked={account?.siteIds.includes(site.id)}
                      />{" "}
                      {site.name}
                      {site.active ? "" : " (inactive)"}
                    </label>
                  ))}
                </fieldset>
                <fieldset>
                  <legend>Monitoring access</legend>
                  <p className="superadmin-muted">
                    Choose which systems the user can see at each assigned site.
                    A system grant only applies while site access is enabled.
                  </p>
                  {sites.map((site) => (
                    <details key={site.id}>
                      <summary>{site.name}</summary>
                      {getManagedSiteSystems(site).map((system) => (
                        <label className="superadmin-checkbox" key={system.id}>
                          <input
                            type="checkbox"
                            name={"system:" + site.id}
                            value={system.id}
                            defaultChecked={
                              account?.systemsBySite?.[site.id]?.includes(
                                system.id,
                              ) ?? true
                            }
                          />
                          {system.name}
                        </label>
                      ))}
                    </details>
                  ))}
                </fieldset>
                {account?.email === bootstrapEmail && (
                  <p className="superadmin-muted">
                    The built-in Superadmin must stay active.
                  </p>
                )}
              </div>

              {section === "Activity" && account && (
                <div className="directory-fields">
                  <p>
                    Last active:{" "}
                    {account.lastSignIn
                      ? time.format(new Date(account.lastSignIn))
                      : "Never signed in"}
                  </p>
                  <ul className="superadmin-event-list">
                    {audit
                      .filter(
                        ({ category, target }) =>
                          category === "Users" && target === account.email,
                      )
                      .slice(0, 5)
                      .map(({ id, action, date }) => (
                        <li key={id}>
                          <strong>{action}</strong>
                          <time dateTime={date}>
                            {time.format(new Date(date))}
                          </time>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {(admin ? section === "Permissions" : section !== "Activity") && (
                <div className="superadmin-actions">
                  <button type="submit" className="superadmin-button">
                    {admin
                      ? "Save access"
                      : account
                        ? "Save changes"
                        : "Create account"}
                  </button>
                  <button
                    type="button"
                    className="directory-secondary-button"
                    onClick={() => openPanel(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </section>
        )}
        {panel === null && (
          <aside
            className="superadmin-card"
            aria-labelledby="user-details-title"
          >
            <h2 id="user-details-title">User Details</h2>
            <p className="superadmin-muted">
              Select a user to view their details and manage their access.
            </p>
            <h3 className="directory-summary-heading">
              Site access at a glance
            </h3>
            <ul className="superadmin-event-list">
              {sites
                .filter((site) => site.active)
                .map((site) => (
                  <li key={site.id}>
                    <button
                      type="button"
                      className="superadmin-text-link"
                      onClick={() => setSiteId(site.id)}
                    >
                      {site.name}
                    </button>
                    <span>
                      {
                        accounts.filter(
                          (user) => user.active && siteCount(user, [site]),
                        ).length
                      }{" "}
                      active users
                    </span>
                  </li>
                ))}
            </ul>
            {!sites.some((site) => site.active) && (
              <p className="superadmin-muted">No active sites.</p>
            )}
          </aside>
        )}
      </div>
    </main>
  );
}
