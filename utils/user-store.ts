import { useSyncExternalStore } from "react";
import { initialUsers } from "@/data/users";
import type { User } from "@/data/users";
import { mockAccounts } from "@/data/mock-accounts";
import { emptyAccess, initialAccess, permissions } from "@/data/permissions";
import type { Access } from "@/data/permissions";
import { projects as starterProjects } from "@/data/projects";
import {
  getProjectLevel,
  hasPermission,
  roleSupportsPermission,
} from "./permissions";

export const usersStorageKey = "nexus-management-users";
export const usersChangedEvent = "nexus-users-updated";
export type UserChanges = {
  addedUsers: User[];
  accessByEmail: Record<string, Access>;
  rolesByEmail?: Record<string, User["role"]>;
  passwordsByEmail?: Record<string, string>;
  statusesByEmail?: Record<string, User["status"]>;
  lastActiveByEmail?: Record<string, string>;
};

export function getUserSnapshot() {
  try {
    return localStorage.getItem(usersStorageKey) ?? "";
  } catch {
    return "";
  }
}

export function readUserChanges(snapshot: string): UserChanges {
  try {
    const value = JSON.parse(snapshot) as Partial<UserChanges> | null;
    if (
      value &&
      Array.isArray(value.addedUsers) &&
      value.accessByEmail &&
      typeof value.accessByEmail === "object"
    ) {
      // The old table could contain a separate user with the bootstrap email.
      // Before demo passwords existed, those overrides must not lock out setup.
      const rolesByEmail = { ...value.rolesByEmail };
      const statusesByEmail = { ...value.statusesByEmail };
      if (!value.passwordsByEmail) {
        for (const account of mockAccounts) {
          delete rolesByEmail[account.email];
          delete statusesByEmail[account.email];
        }
      }
      return {
        ...value,
        rolesByEmail,
        statusesByEmail,
        addedUsers: value.addedUsers.filter(
          (user) =>
            user &&
            typeof user.email === "string" &&
            typeof user.name === "string" &&
            ["User", "Admin", "Superadmin"].includes(user.role) &&
            ["Active", "Inactive", "Pending"].includes(user.status),
        ),
      } as UserChanges;
    }
  } catch {
    /* Start with the bootstrap account if the saved JSON cannot be read. */
  }
  return { addedUsers: [], accessByEmail: {} };
}

function getKnownProjects() {
  let created: { key: string; name: string }[] = [];
  try {
    const parsed = JSON.parse(
      localStorage.getItem("nexus-initialized-projects") ?? "[]",
    );
    if (Array.isArray(parsed))
      created = parsed.filter(
        (project) =>
          project &&
          typeof project.key === "string" &&
          typeof project.name === "string",
      );
  } catch {
    /* Starter projects remain available. */
  }
  return [...starterProjects, ...created];
}

export function getUserAccess(
  email: string,
  changes = readUserChanges(getUserSnapshot()),
): Access {
  const access =
    changes.accessByEmail[email] ?? initialAccess[email] ?? emptyAccess;
  const record = [...initialUsers, ...changes.addedUsers].find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
  const savedRole = changes.rolesByEmail?.[email] ?? record?.role;
  const role =
    savedRole && ["User", "Admin", "Superadmin"].includes(savedRole)
      ? savedRole
      : record?.role;
  const knownNames = permissions.map(([name]) => name);
  const assignments: Record<string, string> = {};
  const knownProjects = getKnownProjects();
  for (const [id, level] of Object.entries(access.projects ?? {})) {
    if (level !== "Viewer" && level !== "Editor") continue;
    const project = knownProjects.find(
      (project) => project.key === id || project.name === id,
    );
    if (project) assignments[project.key] = level;
  }
  return {
    permissions: Array.isArray(access.permissions)
      ? access.permissions.filter(
          (name) =>
            knownNames.includes(name as (typeof knownNames)[number]) &&
            (!role || roleSupportsPermission(role, name)),
        )
      : [],
    projects: assignments,
  };
}

export function getUsers(changes = readUserChanges(getUserSnapshot())): User[] {
  const records = new Map(
    initialUsers.map((user) => [user.email.toLowerCase(), user]),
  );
  for (const user of changes.addedUsers) {
    const email = user.email.trim().toLowerCase();
    if (!records.has(email)) records.set(email, { ...user, email });
  }
  return [...records.values()].map((user) => {
    const role = changes.rolesByEmail?.[user.email] ?? user.role;
    const status = changes.statusesByEmail?.[user.email] ?? user.status;
    const access = getUserAccess(user.email, changes);
    return {
      ...user,
      role: ["User", "Admin", "Superadmin"].includes(role) ? role : user.role,
      status: ["Active", "Inactive", "Pending"].includes(status)
        ? status
        : user.status,
      projects: Object.values(access.projects).filter(
        (level) => level === "Viewer" || level === "Editor",
      ).length,
      lastActive: changes.lastActiveByEmail?.[user.email] ?? user.lastActive,
    };
  });
}

export function getUserPassword(email: string, changes: UserChanges) {
  return (
    changes.passwordsByEmail?.[email] ??
    mockAccounts.find((account) => account.email === email)?.password
  );
}

export function saveUserChanges(changes: UserChanges) {
  try {
    localStorage.setItem(usersStorageKey, JSON.stringify(changes));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(usersChangedEvent));
  return true;
}

export function subscribeToUsers(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === usersStorageKey || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(usersChangedEvent, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(usersChangedEvent, listener);
  };
}

export function useUsers() {
  const snapshot = useSyncExternalStore(
    subscribeToUsers,
    getUserSnapshot,
    () => "",
  );
  const changes = readUserChanges(snapshot);
  return { users: getUsers(changes), changes };
}

export function getCurrentUser(changes = readUserChanges(getUserSnapshot())) {
  try {
    const session = JSON.parse(localStorage.getItem("credential") ?? "null");
    if (!session || typeof session.token !== "string" || !session.token)
      return undefined;
    return getUsers(changes).find(
      (user) => user.email === session.email && user.status === "Active",
    );
  } catch {
    return undefined;
  }
}

export function currentUserCan(permission: (typeof permissions)[number][0]) {
  const changes = readUserChanges(getUserSnapshot());
  const user = getCurrentUser(changes);
  return hasPermission(
    user?.role,
    user ? getUserAccess(user.email, changes) : emptyAccess,
    permission,
  );
}

export function getUserMetrics(users: User[]) {
  return [
    ["Total Users", users.length, "Registered accounts"],
    [
      "Active Users",
      users.filter((user) => user.status === "Active").length,
      "Can sign in",
    ],
    [
      "Inactive Users",
      users.filter((user) => user.status === "Inactive").length,
      "Sign-in disabled",
    ],
    [
      "Pending Requests",
      users.filter((user) => user.status === "Pending").length,
      "Awaiting activation",
    ],
  ] as const;
}

function canManageUser(actor: User | undefined, target: User) {
  return Boolean(
    actor &&
    currentUserCan("Manage Users") &&
    (actor.role === "Superadmin" || target.role === "User"),
  );
}

export function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: User["role"];
}): string | undefined {
  const changes = readUserChanges(getUserSnapshot());
  const actor = getCurrentUser(changes);
  if (!actor || !currentUserCan("Manage Users"))
    return "You do not have permission to create users.";
  if (actor.role !== "Superadmin" && input.role !== "User")
    return "Only Superadmin can create management accounts.";
  const name = input.name.trim(),
    email = input.email.trim().toLowerCase();
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Enter a name and valid email.";
  if (input.password.trim().length < 4)
    return "Use a demo password with at least 4 characters.";
  if (getUsers(changes).some((user) => user.email.toLowerCase() === email))
    return "A user with this email already exists.";
  if (!["User", "Admin", "Superadmin"].includes(input.role))
    return "Choose a valid role.";
  const user: User = {
    name,
    email,
    role: input.role,
    projects: 0,
    status: "Active",
    lastActive: "Never",
  };
  const updated: UserChanges = {
    ...changes,
    addedUsers: [...changes.addedUsers, user],
    passwordsByEmail: {
      ...changes.passwordsByEmail,
      [email]: input.password.trim(),
    },
    accessByEmail: {
      ...changes.accessByEmail,
      [email]: { permissions: ["View Dashboard"], projects: {} },
    },
  };
  if (!saveUserChanges(updated)) return "This browser could not save the user.";
}

export function updateUserAccount(
  email: string,
  updates: { role: User["role"]; status: User["status"]; password?: string },
): string | undefined {
  const changes = readUserChanges(getUserSnapshot());
  const actor = getCurrentUser(changes),
    users = getUsers(changes);
  const target = users.find((user) => user.email === email);
  if (!actor || !target || !currentUserCan("Manage Users"))
    return "You do not have permission to edit this account.";
  if (
    actor.role !== "Superadmin" &&
    (target.role === "Superadmin" || updates.role === "Superadmin")
  )
    return "Only Superadmin can edit Superadmin accounts.";
  if (
    actor.role !== "Superadmin" &&
    target.role === "Admin" &&
    (updates.status !== target.status || updates.password)
  )
    return "Only Superadmin can change another Admin’s sign-in details.";
  if (
    !["User", "Admin", "Superadmin"].includes(updates.role) ||
    !["Active", "Inactive", "Pending"].includes(updates.status)
  )
    return "Choose a valid role and status.";
  if (
    target.role === "Superadmin" &&
    target.status === "Active" &&
    (updates.role !== "Superadmin" || updates.status !== "Active") &&
    users.filter(
      (user) => user.role === "Superadmin" && user.status === "Active",
    ).length === 1
  )
    return "Keep at least one active Superadmin account.";
  if (updates.password && updates.password.trim().length < 4)
    return "Use a demo password with at least 4 characters.";
  const access = getUserAccess(email, changes);
  const updated: UserChanges = {
    ...changes,
    rolesByEmail: { ...changes.rolesByEmail, [email]: updates.role },
    statusesByEmail: { ...changes.statusesByEmail, [email]: updates.status },
    passwordsByEmail: updates.password
      ? { ...changes.passwordsByEmail, [email]: updates.password.trim() }
      : changes.passwordsByEmail,
    accessByEmail: {
      ...changes.accessByEmail,
      [email]: {
        ...access,
        permissions: access.permissions.filter((permission) =>
          roleSupportsPermission(updates.role, permission),
        ),
      },
    },
  };
  if (!saveUserChanges(updated))
    return "This browser could not save the account.";
}

export function updateUserAccess(
  email: string,
  access: Access,
): string | undefined {
  const changes = readUserChanges(getUserSnapshot());
  const actor = getCurrentUser(changes),
    target = getUsers(changes).find((user) => user.email === email);
  if (!target || !canManageUser(actor, target))
    return "You do not have permission to edit this account’s access.";
  if (target.role === "Superadmin")
    return "Superadmin accounts already have full access.";
  const allowed = permissions.map(([name]) => name);
  if (
    access.permissions.some(
      (name) =>
        !allowed.includes(name as (typeof allowed)[number]) ||
        !roleSupportsPermission(target.role, name),
    )
  )
    return "One of these permissions is not available for this role.";
  if (
    actor?.role !== "Superadmin" &&
    access.permissions.some(
      (name) => name !== "View Dashboard" && name !== "Access Projects",
    )
  )
    return "Only Superadmin can grant management permissions.";
  const knownProjects = getKnownProjects();
  const assignments: Record<string, string> = {};
  for (const [id, level] of Object.entries(access.projects)) {
    if (!level) continue;
    if (level !== "Viewer" && level !== "Editor")
      return "Choose Viewer or Editor for project access.";
    const project = knownProjects.find(
      (project) => project.key === id || project.name === id,
    );
    if (!project) return "A selected project no longer exists.";
    if (actor && actor.role !== "Superadmin") {
      const actorLevel = getProjectLevel(
        actor.role,
        getUserAccess(actor.email, changes),
        project,
      );
      if (!actorLevel || (level === "Editor" && actorLevel !== "Editor"))
        return "You cannot grant more project access than you have.";
    }
    assignments[project.key] = level;
  }
  if (
    !saveUserChanges({
      ...changes,
      accessByEmail: {
        ...changes.accessByEmail,
        [email]: {
          permissions: [...new Set(access.permissions)],
          projects: assignments,
        },
      },
    })
  )
    return "This browser could not save permissions.";
}
