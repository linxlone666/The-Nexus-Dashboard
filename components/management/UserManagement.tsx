"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import { recordAuditActivity } from "./audit-log";
import { ManagementMetrics } from "./ManagementMetrics";
import { Icon, AdminSuperadminLayout } from "./AdminSuperadminLayout";
import type { ManagementRole } from "./AdminSuperadminLayout";
import { userMetrics } from "./management-data";
import styles from "./management.module.css";

type User = {
  name: string;
  email: string;
  role: "User" | "Admin";
  projects: number;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
};

const initialUsers: User[] = [
  { name: "Alex Turner", email: "alex@example.com", role: "User", projects: 3, status: "Active", lastActive: "Apr 24, 2026" },
  { name: "Maria Garcia", email: "maria@example.com", role: "User", projects: 5, status: "Active", lastActive: "Apr 24, 2026" },
  { name: "James Park", email: "james@example.com", role: "User", projects: 2, status: "Inactive", lastActive: "Apr 20, 2026" },
  { name: "Sophia Kim", email: "sophia@example.com", role: "User", projects: 4, status: "Active", lastActive: "Apr 24, 2026" },
  { name: "Daniel Brown", email: "daniel@example.com", role: "User", projects: 1, status: "Active", lastActive: "Apr 23, 2026" },
  { name: "Olivia Martinez", email: "olivia@example.com", role: "User", projects: 3, status: "Active", lastActive: "Apr 21, 2026" },
  { name: "Ethan Wilson", email: "ethan@example.com", role: "User", projects: 0, status: "Pending", lastActive: "Apr 18, 2026" },
  { name: "Sarah Lee", email: "sarah@example.com", role: "User", projects: 6, status: "Active", lastActive: "Apr 24, 2026" },
];

const permissions = [
  ["View Dashboard", "Main dashboard"],
  ["Access Projects", "Assigned projects"],
  ["Manage Vendors", "Vendor information", true],
  ["Manage Integrations", "Data integrations", true],
  ["View Audit Logs", "System logs", true],
  ["Manage Users", "User accounts", true],
  ["Manage Settings", "Platform settings", true],
] as const;

const projects = ["Retail Analytics", "Customer Insights", "Sales Dashboard", "Marketing Data"];
type Access = { permissions: string[]; projects: Record<string, string> };
const emptyAccess: Access = { permissions: [], projects: {} };
const initialAccess: Record<string, Access> = {
  [initialUsers[0].email]: {
    permissions: ["View Dashboard", "Access Projects", "Manage Integrations"],
    projects: { "Retail Analytics": "Editor", "Customer Insights": "Viewer" },
  },
};

type SavedUsers = {
  addedUsers: User[];
  accessByEmail: Record<string, Access>;
  rolesByEmail?: Record<string, User["role"]>;
};
const storageKey = "nexus-management-users";
const storageEvent = "nexus-users-updated";

function getSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? "";
  } catch {
    return "";
  }
}

function readUsers(snapshot: string): SavedUsers {
  if (snapshot) {
    try {
      const saved: SavedUsers | null = JSON.parse(snapshot);
      if (Array.isArray(saved?.addedUsers) && saved.accessByEmail && typeof saved.accessByEmail === "object") return saved;
    } catch {
      // Fall back to the starter records if the saved data cannot be read.
    }
  }
  return { addedUsers: [], accessByEmail: {} };
}

function getUsers(saved: SavedUsers) {
  return [...initialUsers, ...saved.addedUsers].map((user) => {
    const role = saved.rolesByEmail?.[user.email];
    return role === "User" || role === "Admin" ? { ...user, role } : user;
  });
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(storageEvent, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(storageEvent, listener);
  };
}

function saveUsers(saved: SavedUsers) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(saved));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(storageEvent));
  return true;
}

const tabs = ["General", "Permissions", "Activity"] as const;
type UserTab = (typeof tabs)[number];

function Status({ status, className }: { status: User["status"]; className?: string }) {
  return <Badge className={className} color={status === "Active" ? "success" : status === "Pending" ? "warning" : "gray"}>{status}</Badge>;
}

export function UserManagement({ role: managementRole = "Admin" }: { role?: ManagementRole }) {
  const canManagePlatform = managementRole === "Superadmin";
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const saved = readUsers(snapshot);
  const users = getUsers(saved);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [projectAccess, setProjectAccess] = useState("All");
  const [checked, setChecked] = useState<string[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(initialUsers[0].email);
  const selected = users.find((user) => user.email === selectedEmail);
  const [roleDraft, setRoleDraft] = useState<User["role"] | null>(null);
  const [tab, setTab] = useState<UserTab>("Permissions");
  const [draftChanges, setDraftChanges] = useState<Access | null>(null);
  const savedAccess = selected ? saved.accessByEmail[selected.email] ?? initialAccess[selected.email] ?? emptyAccess : emptyAccess;
  const draft = draftChanges ?? savedAccess;
  const [projectQuery, setProjectQuery] = useState("");
  const [message, setMessage] = useState("");
  const [inviteError, setInviteError] = useState("");
  const inviteDialog = useRef<HTMLDialogElement>(null);

  const visible = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()) &&
    (role === "All" || user.role === role) &&
    (status === "All" || user.status === status) &&
    (projectAccess === "All" || (projectAccess === "Assigned" ? user.projects > 0 : user.projects === 0)),
  );
  const canEditSelected = selected && (canManagePlatform || selected.role === "User");
  const allVisibleChecked = visible.length > 0 && visible.every((user) => checked.includes(user.email));

  function openUser(user: User) {
    setSelectedEmail(user.email);
    setRoleDraft(null);
    setDraftChanges(null);
    setTab("Permissions");
    setProjectQuery("");
    setMessage("");
  }

  function saveRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedEmail || !roleDraft) return;

    const current = readUsers(getSnapshot());
    const user = getUsers(current).find(({ email }) => email === selectedEmail);
    if (!user || user.role === roleDraft) return;

    const rolesByEmail = { ...current.rolesByEmail, [user.email]: roleDraft };
    if (!saveUsers({ ...current, rolesByEmail })) {
      setMessage("This browser could not save the role.");
      return;
    }

    setRoleDraft(null);
    setDraftChanges(null);
    recordAuditActivity({
      role: managementRole, category: "Users", action: "User role changed", target: user.name, outcome: "Success",
    });
    setMessage("Role updated to " + roleDraft + ".");
  }

  function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim().toLowerCase();

    if (!name) {
      setInviteError("Enter a name.");
      return;
    }
    const current = readUsers(getSnapshot());
    if ([...initialUsers, ...current.addedUsers].some((user) => user.email === email)) {
      setInviteError("A user with this email already exists.");
      return;
    }
    const user: User = {
      name, email, role: canManagePlatform && data.get("role") === "Admin" ? "Admin" : "User",
      projects: 0, status: "Pending", lastActive: "—",
    };
    if (!saveUsers({ ...current, addedUsers: [...current.addedUsers, user] })) {
      setInviteError("This browser could not save the user.");
      return;
    }
    recordAuditActivity({
      role: managementRole, category: "Users", action: "Demo user added", target: user.name, outcome: "Success",
    });
    setQuery("");
    setRole("All");
    setStatus("All");
    setProjectAccess("All");
    openUser(user);
    setMessage(`${name} was added to this preview.`);
    event.currentTarget.reset();
    inviteDialog.current?.close();
  }

  function exportUsers() {
    const rows = checked.length ? users.filter((user) => checked.includes(user.email)) : visible;
    const csv = [
      ["Name", "Email", "Role", "Projects", "Status", "Last active"],
      ...rows.map((user) => [user.name, user.email, user.role, user.projects, user.status, user.lastActive]),
    ].map((row) => row.map((value) => {
      const cell = String(value);
      const safe = /^[=+\-@\t\r\n]/.test(cell) ? "'" + cell : cell;
      return '"' + safe.replaceAll('"', '""') + '"';
    }).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "nexus-users.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function setProject(project: string, level: string) {
    setDraftChanges({ ...draft, projects: { ...draft.projects, [project]: level } });
    setMessage("");
  }

  return (
    <AdminSuperadminLayout role={managementRole} active="Users" query={query} onQueryChange={setQuery} searchLabel="Search management users">
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
          <Button size="xs" appearance="outline" type="button" onPress={exportUsers} disabled={!checked.length && !visible.length}>Export users</Button>
          <Button size="xs" type="button"
            onPress={() => { setInviteError(""); inviteDialog.current?.showModal(); }}>+ Add User</Button>
        </div>
      </div>

      <div className={styles.columns}>
        <div className={styles.userList}>
          <ManagementMetrics metrics={userMetrics.map(([label, value, description], index) => [
            label,
            value + (index === 0 || index === 3 ? users.length - initialUsers.length : 0),
            description,
          ])} />

          <section className={styles.card} aria-labelledby="users-heading">
            <h2 id="users-heading">Users</h2>
            <div className={styles.userFilters}>
              <Input type="search" placeholder="Search users..." aria-label="Search users"
                value={query} onChange={(event) => setQuery(event.target.value)} />
              <label>Role<select value={role} onChange={(event) => setRole(event.target.value)}>
                <option>All</option><option>User</option><option>Admin</option>
              </select></label>
              <label>Status<select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option>All</option><option>Active</option><option>Inactive</option><option>Pending</option>
              </select></label>
              <label>Project Access<select value={projectAccess} onChange={(event) => setProjectAccess(event.target.value)}>
                <option>All</option><option>Assigned</option><option>Unassigned</option>
              </select></label>
              <Button size="xs" appearance="outline" type="button" onPress={() => { setQuery(""); setRole("All"); setStatus("All"); setProjectAccess("All"); }}>Reset</Button>
            </div>

            <div className={styles.tableScroll}>
              <table className={`${styles.table} ${styles.userTable}`}>
                <thead><tr>
                  <th scope="col"><input type="checkbox" aria-label="Select all visible users" checked={allVisibleChecked}
                    disabled={!visible.length} onChange={() => setChecked((current) => allVisibleChecked
                      ? current.filter((email) => !visible.some((user) => user.email === email))
                      : [...new Set([...current, ...visible.map((user) => user.email)])])} /></th>
                  {["Name", "Email", "Role", "Project Access", "Status", "Last Active", "Actions"].map((label) => <th key={label} scope="col">{label}</th>)}
                </tr></thead>
                <tbody>
                  {visible.map((user) => (
                    <tr key={user.email}>
                      <td><input type="checkbox" aria-label={`Select ${user.name}`} checked={checked.includes(user.email)}
                        onChange={(event) => setChecked(event.target.checked ? [...checked, user.email] : checked.filter((email) => email !== user.email))} /></td>
                      <th scope="row"><button type="button" className={styles.rowButton}
                        aria-pressed={selected?.email === user.email} onClick={() => openUser(user)}>{user.name}</button></th>
                      <td>{user.email}</td><td><Badge color="gray">{user.role}</Badge></td>
                      <td>{user.projects} {user.projects === 1 ? "project" : "projects"}</td>
                      <td><Status status={user.status} /></td><td>{user.lastActive}</td>
                      <td><button type="button" className={styles.rowButton} aria-label={`Details for ${user.name}`} onClick={() => openUser(user)}>•••</button></td>
                    </tr>
                  ))}
                  {!visible.length && <tr><td colSpan={8}>No users match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
            <p className={styles.tableSummary}>Showing {visible.length} of {users.length} sample users</p>
          </section>
        </div>

        <aside className={styles.card} aria-labelledby="user-details">
          <div className={styles.detailHeading}>
            <h2 id="user-details">User Details</h2>
            {selected && <button type="button" className={styles.rowButton} aria-label="Close user details"
              onClick={() => { setSelectedEmail(null); setMessage(""); }}><Icon name="close" /></button>}
          </div>
          {selected ? (
            <>
              <div className={styles.profile}>
                <span className={styles.avatar} aria-hidden="true">
                  {selected.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
                </span>
                <div><h3>{selected.name}</h3><p className={styles.muted}>{selected.email}</p></div>
                <Status status={selected.status} className="ml-auto" />
              </div>
              <div className={styles.tabs} aria-label="User information">
                {tabs.map((name) => <button type="button" key={name} aria-pressed={tab === name}
                  onClick={() => setTab(name)}>{name}</button>)}
              </div>
              {tab === "General" && (
                <form className={styles.settingsForm} onSubmit={saveRole}>
                  <p className={styles.muted}>{selected.projects} assigned projects</p>
                  <label>
                    <span>Account role</span>
                    <select value={roleDraft ?? selected.role} onChange={(event) => {
                      setRoleDraft(event.target.value === "Admin" ? "Admin" : "User");
                      setMessage("");
                    }}>
                      <option>User</option><option>Admin</option>
                    </select>
                  </label>
                  <div className={styles.actions}>
                    <Button size="xs" type="submit" disabled={!roleDraft || roleDraft === selected.role}>Save role</Button>
                  </div>
                </form>
              )}
              {tab === "Activity" && <p className={styles.record}>Last active: {selected.lastActive}</p>}
              {tab === "Permissions" && (
                <>
                  <fieldset className={styles.permissionGroup}>
                    <legend>System Permissions</legend>
                    <p className={styles.muted}>Select what this user can access in the system.</p>
                    {permissions.map(([name, description, platformOnly]) => (
                      <label key={name} className={styles.permission}>
                        <span><input type="checkbox" checked={draft.permissions.includes(name)}
                          disabled={!canEditSelected || (platformOnly && !canManagePlatform)} onChange={(event) => {
                          const enabled = event.target.checked;
                          setDraftChanges({ ...draft, permissions: enabled
                            ? [...draft.permissions, name] : draft.permissions.filter((item) => item !== name) });
                          setMessage("");
                        }} />{name}</span>
                        <small>{platformOnly && !canManagePlatform ? "Superadmin only" : description}</small>
                      </label>
                    ))}
                  </fieldset>
                  <fieldset className={styles.permissionGroup}>
                    <legend>Project Access</legend>
                    <p className={styles.muted}>Select which projects this user can access.</p>
                    <Input type="search" placeholder="Search projects..." aria-label="Search project permissions"
                      value={projectQuery} onChange={(event) => setProjectQuery(event.target.value)} />
                    {projects.filter((project) => project.toLowerCase().includes(projectQuery.trim().toLowerCase())).map((project) => (
                      <div className={styles.permission} key={project}>
                        <label><input type="checkbox" checked={Boolean(draft.projects[project])} disabled={!canEditSelected}
                          onChange={(event) => setProject(project, event.target.checked ? "Viewer" : "")} />{project}</label>
                        <select aria-label={`Access level for ${project}`} value={draft.projects[project] || "Viewer"}
                          disabled={!canEditSelected || !draft.projects[project]} onChange={(event) => setProject(project, event.target.value)}>
                          <option>Viewer</option><option>Editor</option>
                        </select>
                      </div>
                    ))}
                  </fieldset>
                  {canEditSelected ? <div className={styles.actions}>
                    <Button size="xs" appearance="outline" type="button" onPress={() => { setDraftChanges(null); setMessage(""); }}>Cancel</Button>
                    <Button size="xs" type="button" onPress={() => {
                      const current = readUsers(getSnapshot());
                      const user = getUsers(current).find(({ email }) => email === selected.email);
                      if (!user || (!canManagePlatform && user.role !== "User")) {
                        setMessage("This account’s permissions can only be edited by Superadmin.");
                        return;
                      }
                      if (!saveUsers({ ...current, accessByEmail: { ...current.accessByEmail, [selected.email]: draft } })) {
                        setMessage("This browser could not save permissions.");
                        return;
                      }
                      setDraftChanges(null);
                      recordAuditActivity({
                        role: managementRole, category: "Users", action: "Permissions saved",
                        target: selected.name, outcome: "Success",
                      });
                      setMessage("Permissions saved in this preview.");
                    }}>Save Permissions</Button>
                  </div> : <p className={styles.muted}>Only Superadmin can edit permissions for an Admin account.</p>}
                </>
              )}
            </>
          ) : <p className={styles.muted}>Select a user to see their details.</p>}
          <p className={styles.feedback} role="status">{message}</p>
        </aside>
      </div>

      <dialog ref={inviteDialog} className={styles.dialog} aria-labelledby="add-user-heading">
        <form onSubmit={addUser}>
          <h2 id="add-user-heading">Add User</h2>
          <label>Name<Input name="name" required autoComplete="name" /></label>
          <label>Email<Input name="email" type="email" required autoComplete="email" /></label>
          {canManagePlatform && (
            <label>Role<select name="role"><option>User</option><option>Admin</option></select></label>
          )}
          {inviteError && <p role="alert">{inviteError}</p>}
          <div className={styles.actions}>
            <Button size="xs" appearance="outline" type="button" onPress={() => inviteDialog.current?.close()}>Cancel</Button>
            <Button size="xs" type="submit">Add User</Button>
          </div>
        </form>
      </dialog>
    </AdminSuperadminLayout>
  );
}
