"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { recordAuditActivity } from "./audit-log";
import { ManagementMetrics } from "./ManagementMetrics";
import { Icon, AdminSuperadminLayout } from "./AdminSuperadminLayout";
import type { ManagementRole } from "./AdminSuperadminLayout";
import { initialUsers } from "@/data/users";
import type { User } from "@/data/users";
import { permissions, emptyAccess } from "@/data/permissions";
import type { Access } from "@/data/permissions";
import styles from "./management.module.css";

import {
  createUser as createAccount,
  updateUserAccount,
  updateUserAccess,
  useUsers,
  getUserAccess,
  getUserMetrics,
  getUsers,
} from "@/utils/user-store";
import { useDemoSession } from "@/utils/demo-session";
import {
  getProjectLevel,
  hasPermission,
  roleSupportsPermission,
} from "@/utils/permissions";
import type { ProjectReference } from "@/utils/permissions";
import { useProjects } from "./project-storage";

const tabs = ["General", "Permissions", "Activity"] as const;
type UserTab = (typeof tabs)[number];

function Status({
  status,
  className,
}: {
  status: User["status"];
  className?: string;
}) {
  return (
    <Badge
      className={className}
      color={
        status === "Active"
          ? "success"
          : status === "Pending"
            ? "warning"
            : "gray"
      }
    >
      {status}
    </Badge>
  );
}

// Manage accounts and project permissions within the active management role.
export function UserManagement({
  role: managementRole = "Admin",
}: {
  role?: ManagementRole;
}) {
  const canManagePlatform = managementRole === "Superadmin";
  const { changes: saved, users: allUsers } = useUsers();
  const users = canManagePlatform
    ? allUsers
    : allUsers.filter((user) => user.role !== "Superadmin");
  const allProjects = useProjects();
  const { credential, access: actorAccess } = useDemoSession();
  const projects = allProjects.filter((project) =>
    Boolean(getProjectLevel(credential?.role, actorAccess, project)),
  );
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [projectAccess, setProjectAccess] = useState("All");
  const [checked, setChecked] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(
    initialUsers[0]?.email ?? null,
  );
  const selected = users.find((user) => user.email === selectedEmail);
  const [roleDraft, setRoleDraft] = useState<User["role"] | null>(null);
  const [statusDraft, setStatusDraft] = useState<User["status"] | null>(null);
  const [passwordDraft, setPasswordDraft] = useState("");
  const [tab, setTab] = useState<UserTab>("Permissions");
  const [draftChanges, setDraftChanges] = useState<Access | null>(null);
  const savedAccess = selected
    ? getUserAccess(selected.email, saved)
    : emptyAccess;
  const draft = draftChanges ?? savedAccess;
  const [projectQuery, setProjectQuery] = useState("");
  const [message, setMessage] = useState("");
  const [inviteError, setInviteError] = useState("");
  const inviteDialog = useRef<HTMLDialogElement>(null);

  // Apply the toolbar and table filters to the role-scoped account list.
  const visible = users.filter(
    (user) =>
      `${user.name} ${user.email}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (role === "All" || user.role === role) &&
      (status === "All" || user.status === status) &&
      (projectAccess === "All" ||
        (projectAccess === "Assigned"
          ? user.projects > 0
          : user.projects === 0)),
  );
  const canEditSelected =
    selected &&
    selected.role !== "Superadmin" &&
    (canManagePlatform || selected.role === "User");
  const allVisibleChecked =
    visible.length > 0 && visible.every((user) => checked.includes(user.email));

  // Clear unsaved edits and feedback when switching the selected account.
  function openUser(user: User) {
    setSelectedEmail(user.email);
    setRoleDraft(null);
    setStatusDraft(null);
    setPasswordDraft("");
    setDraftChanges(null);
    setTab("Permissions");
    setProjectQuery("");
    setMessage("");
  }

  // Save account metadata and an optional demo password as one update.
  function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const error = updateUserAccount(selected.email, {
      role: roleDraft ?? selected.role,
      status: statusDraft ?? selected.status,
      password: passwordDraft || undefined,
    });
    if (error) {
      setMessage(error);
      return;
    }
    setRoleDraft(null);
    setStatusDraft(null);
    setPasswordDraft("");
    setDraftChanges(null);
    recordAuditActivity({
      role: managementRole,
      category: "Users",
      action: "Account updated",
      target: selected.name,
      outcome: "Success",
    });
    setMessage("Account saved. Role and status changes apply immediately.");
  }

  // Create the account, then select it so its permissions can be configured.
  function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim().toLowerCase();
    const accountRole = canManagePlatform
      ? (String(data.get("role")) as User["role"])
      : "User";
    const error = createAccount({
      name,
      email,
      password: String(data.get("password")),
      role: accountRole,
    });
    if (error) {
      setInviteError(error);
      return;
    }
    const user = getUsers().find((user) => user.email === email);
    if (!user) return;
    recordAuditActivity({
      role: managementRole,
      category: "Users",
      action: "User created",
      target: name,
      outcome: "Success",
    });
    setQuery("");
    setRole("All");
    setStatus("All");
    setProjectAccess("All");
    openUser(user);
    setMessage(
      name +
        " can now sign in. Choose permissions and project access, then Save Permissions.",
    );
    event.currentTarget.reset();
    inviteDialog.current?.close();
  }

  // Persist the selected user's pending system and project access changes.
  function savePermissions() {
    if (!selected) return;
    const error = updateUserAccess(selected.email, draft);
    if (error) {
      setMessage(error);
      return;
    }
    setDraftChanges(null);
    recordAuditActivity({
      role: managementRole,
      category: "Users",
      action: "Permissions saved",
      target: selected.name,
      outcome: "Success",
    });
    setMessage(
      "Permissions saved. This account’s menus and project access update immediately.",
    );
  }

  // Export selected accounts (or the current filtered list) as spreadsheet-safe CSV.
  function exportUsers() {
    const rows = checked.length
      ? users.filter((user) => checked.includes(user.email))
      : visible;
    const csv = [
      ["Name", "Email", "Role", "Projects", "Status", "Last active"],
      ...rows.map((user) => [
        user.name,
        user.email,
        user.role,
        user.projects,
        user.status,
        user.lastActive,
      ]),
    ]
      .map((row) =>
        row
          .map((value) => {
            const cell = String(value);
            const safe = /^[=+\-@\t\r\n]/.test(cell) ? "'" + cell : cell;
            return '"' + safe.replaceAll('"', '""') + '"';
          })
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexus-users.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Update a project's draft access while removing any legacy name-based entry.
  function setProject(project: ProjectReference, level: string) {
    const assignments = { ...draft.projects };
    delete assignments[project.key];
    delete assignments[project.name];
    if (level) assignments[project.key] = level;
    setDraftChanges({ ...draft, projects: assignments });
    setMessage("");
  }

  // Render the account table, selected-user editor, and account creation dialog.
  return (
    <AdminSuperadminLayout
      role={managementRole}
      active="Users"
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search management users"
    >
      <div className={styles.heading}>
        <div>
          <p>NEXUS / {managementRole} / Users</p>
          <h1>User Management</h1>
          <div className={styles.muted}>
            {canManagePlatform
              ? "Manage user accounts, roles, permissions and project access."
              : "Manage standard users and their access to existing projects."}
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            size="xs"
            appearance="outline"
            type="button"
            onPress={exportUsers}
            disabled={!checked.length && !visible.length}
          >
            Export users
          </Button>
          <Button
            size="xs"
            type="button"
            onPress={() => {
              setInviteError("");
              inviteDialog.current?.showModal();
            }}
          >
            + Create User
          </Button>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.userList}>
          <ManagementMetrics metrics={getUserMetrics(users)} />

          <section className={styles.card} aria-labelledby="users-heading">
            <h2 id="users-heading">Users</h2>
            <div className={styles.userFilters}>
              <Input
                type="search"
                placeholder="Search users..."
                aria-label="Search users"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <label>
                Role
                <select
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                >
                  <option>All</option>
                  <option>User</option>
                  <option>Admin</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Pending</option>
                </select>
              </label>
              <label>
                Project Access
                <select
                  value={projectAccess}
                  onChange={(event) => setProjectAccess(event.target.value)}
                >
                  <option>All</option>
                  <option>Assigned</option>
                  <option>Unassigned</option>
                </select>
              </label>
              <Button
                size="xs"
                appearance="outline"
                type="button"
                onPress={() => {
                  setQuery("");
                  setRole("All");
                  setStatus("All");
                  setProjectAccess("All");
                }}
              >
                Reset
              </Button>
            </div>

            <div className={styles.tableScroll}>
              <table className={`${styles.table} ${styles.userTable}`}>
                <thead>
                  <tr>
                    <th scope="col">
                      <input
                        type="checkbox"
                        aria-label="Select all visible users"
                        checked={allVisibleChecked}
                        disabled={!visible.length}
                        onChange={() =>
                          setChecked((current) =>
                            allVisibleChecked
                              ? current.filter(
                                  (email) =>
                                    !visible.some(
                                      (user) => user.email === email,
                                    ),
                                )
                              : [
                                  ...new Set([
                                    ...current,
                                    ...visible.map((user) => user.email),
                                  ]),
                                ],
                          )
                        }
                      />
                    </th>
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Project Access",
                      "Status",
                      "Last Active",
                      "Actions",
                    ].map((label) => (
                      <th key={label} scope="col">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((user) => (
                    <tr key={user.email}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${user.name}`}
                          checked={checked.includes(user.email)}
                          onChange={(event) =>
                            setChecked(
                              event.target.checked
                                ? [...checked, user.email]
                                : checked.filter(
                                    (email) => email !== user.email,
                                  ),
                            )
                          }
                        />
                      </td>
                      <th scope="row">
                        <button
                          type="button"
                          className={styles.rowButton}
                          aria-pressed={selected?.email === user.email}
                          onClick={() => openUser(user)}
                        >
                          {user.name}
                        </button>
                      </th>
                      <td>{user.email}</td>
                      <td>
                        <Badge color="gray">{user.role}</Badge>
                      </td>
                      <td>
                        {user.projects}{" "}
                        {user.projects === 1 ? "project" : "projects"}
                      </td>
                      <td>
                        <Status status={user.status} />
                      </td>
                      <td>{user.lastActive}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.rowButton}
                          aria-label={`Details for ${user.name}`}
                          onClick={() => openUser(user)}
                        >
                          •••
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={8}>No users match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className={styles.tableSummary}>
              Showing {visible.length} of {users.length} sample users
            </p>
          </section>
        </div>

        <aside className={styles.card} aria-labelledby="user-details">
          <div className={styles.detailHeading}>
            <h2 id="user-details">User Details</h2>
            {selected && (
              <button
                type="button"
                className={styles.rowButton}
                aria-label="Close user details"
                onClick={() => {
                  setSelectedEmail(null);
                  setMessage("");
                }}
              >
                <Icon name="close" />
              </button>
            )}
          </div>
          {selected ? (
            <>
              <div className={styles.profile}>
                <span className={styles.avatar} aria-hidden="true">
                  {selected.name
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </span>
                <div>
                  <h3>{selected.name}</h3>
                  <p className={styles.muted}>{selected.email}</p>
                </div>
                <Status status={selected.status} className="ml-auto" />
              </div>
              <div className={styles.tabs} aria-label="User information">
                {tabs.map((name) => (
                  <button
                    type="button"
                    key={name}
                    aria-pressed={tab === name}
                    onClick={() => setTab(name)}
                  >
                    {name}
                  </button>
                ))}
              </div>
              {tab === "General" && (
                <form className={styles.settingsForm} onSubmit={saveRole}>
                  <p className={styles.muted}>
                    {selected.projects} assigned projects
                  </p>
                  <label>
                    <span>Account role</span>
                    <select
                      value={roleDraft ?? selected.role}
                      onChange={(event) => {
                        setRoleDraft(event.target.value as User["role"]);
                        setMessage("");
                      }}
                    >
                      <option>User</option>
                      <option>Admin</option>
                      {canManagePlatform && <option>Superadmin</option>}
                    </select>
                  </label>
                  <label>
                    Status
                    <select
                      value={statusDraft ?? selected.status}
                      disabled={!canManagePlatform && selected.role === "Admin"}
                      onChange={(event) => {
                        setStatusDraft(event.target.value as User["status"]);
                        setMessage("");
                      }}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                      <option>Pending</option>
                    </select>
                  </label>
                  <label>
                    New demo password
                    <Input
                      type="password"
                      autoComplete="new-password"
                      minLength={4}
                      placeholder="Leave blank to keep the current password"
                      value={passwordDraft}
                      disabled={!canManagePlatform && selected.role === "Admin"}
                      onChange={(event) => setPasswordDraft(event.target.value)}
                    />
                  </label>
                  <p className={styles.muted}>
                    Active accounts can sign in. Inactive and Pending accounts
                    cannot.
                  </p>
                  <div className={styles.actions}>
                    <Button
                      size="xs"
                      type="submit"
                      disabled={
                        (!roleDraft || roleDraft === selected.role) &&
                        (!statusDraft || statusDraft === selected.status) &&
                        !passwordDraft
                      }
                    >
                      Save account
                    </Button>
                  </div>
                </form>
              )}
              {tab === "Activity" && (
                <p className={styles.record}>
                  Last active: {selected.lastActive}
                </p>
              )}
              {tab === "Permissions" && (
                <>
                  <fieldset className={styles.permissionGroup}>
                    <legend>System Permissions</legend>
                    <p className={styles.muted}>
                      Select what this user can access in the system.
                    </p>
                    {permissions.map(([name, description, platformOnly]) => (
                      <label key={name} className={styles.permission}>
                        <span>
                          <input
                            type="checkbox"
                            checked={hasPermission(selected.role, draft, name)}
                            disabled={
                              !canEditSelected ||
                              !roleSupportsPermission(selected.role, name) ||
                              (platformOnly && !canManagePlatform)
                            }
                            onChange={(event) => {
                              const enabled = event.target.checked;
                              setDraftChanges({
                                ...draft,
                                permissions: enabled
                                  ? [...draft.permissions, name]
                                  : draft.permissions.filter(
                                      (item) => item !== name,
                                    ),
                              });
                              setMessage("");
                            }}
                          />
                          {name}
                        </span>
                        <small>
                          {!roleSupportsPermission(selected.role, name)
                            ? "Not available for this account role"
                            : platformOnly && !canManagePlatform
                              ? "Only Superadmin can grant this permission"
                              : description}
                        </small>
                      </label>
                    ))}
                  </fieldset>
                  <fieldset className={styles.permissionGroup}>
                    <legend>Project Access</legend>
                    <p className={styles.muted}>
                      Select which projects this user can access.
                    </p>
                    <Input
                      type="search"
                      placeholder="Search projects..."
                      aria-label="Search project permissions"
                      value={projectQuery}
                      onChange={(event) => setProjectQuery(event.target.value)}
                    />
                    <p className={styles.muted}>
                      Enable Access Projects above. Viewer can read; Editor can
                      also edit the project description.
                    </p>
                    {projects
                      .filter((project) =>
                        project.name
                          .toLowerCase()
                          .includes(projectQuery.trim().toLowerCase()),
                      )
                      .map((project) => {
                        const level =
                          selected.role === "Superadmin"
                            ? "Editor"
                            : (draft.projects[project.key] ??
                              draft.projects[project.name] ??
                              "");
                        const actorLevel = getProjectLevel(
                          credential?.role,
                          actorAccess,
                          project,
                        );
                        return (
                          <div className={styles.permission} key={project.key}>
                            <label>
                              <input
                                type="checkbox"
                                checked={Boolean(level)}
                                disabled={!canEditSelected || !actorLevel}
                                onChange={(event) =>
                                  setProject(
                                    project,
                                    event.target.checked ? "Viewer" : "",
                                  )
                                }
                              />
                              {project.name}
                            </label>
                            <select
                              aria-label={"Access level for " + project.name}
                              value={level || "Viewer"}
                              disabled={
                                !canEditSelected || !level || !actorLevel
                              }
                              onChange={(event) =>
                                setProject(project, event.target.value)
                              }
                            >
                              <option>Viewer</option>
                              <option disabled={actorLevel !== "Editor"}>
                                Editor
                              </option>
                            </select>
                          </div>
                        );
                      })}
                  </fieldset>
                  {canEditSelected ? (
                    <div className={styles.actions}>
                      <Button
                        size="xs"
                        appearance="outline"
                        type="button"
                        onPress={() => {
                          setDraftChanges(null);
                          setMessage("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="xs" type="button" onPress={savePermissions}>
                        Save Permissions
                      </Button>
                    </div>
                  ) : (
                    <p className={styles.muted}>
                      {selected.role === "Superadmin"
                        ? "Superadmin accounts automatically have full access."
                        : "Only Superadmin can edit permissions for an Admin account."}
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <p className={styles.muted}>Select a user to see their details.</p>
          )}
          <p className={styles.feedback} role="status">
            {message}
          </p>
        </aside>
      </div>

      <dialog
        ref={inviteDialog}
        className={styles.dialog}
        aria-labelledby="add-user-heading"
      >
        <form onSubmit={addUser}>
          <h2 id="add-user-heading">Create User</h2>
          <label>
            Name
            <Input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <Input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Demo password
            <Input
              name="password"
              type="password"
              required
              minLength={4}
              autoComplete="new-password"
            />
          </label>
          <p className={styles.muted}>
            The account starts Active with dashboard access. Set its other
            permissions after creating it. Use demo passwords only.
          </p>
          {canManagePlatform && (
            <label>
              Role
              <select name="role">
                <option>User</option>
                <option>Admin</option>
                {canManagePlatform && <option>Superadmin</option>}
              </select>
            </label>
          )}
          {inviteError && <p role="alert">{inviteError}</p>}
          <div className={styles.actions}>
            <Button
              size="xs"
              appearance="outline"
              type="button"
              onPress={() => inviteDialog.current?.close()}
            >
              Cancel
            </Button>
            <Button size="xs" type="submit">
              Add User
            </Button>
          </div>
        </form>
      </dialog>
    </AdminSuperadminLayout>
  );
}
