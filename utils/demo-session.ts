"use client";

import { useSyncExternalStore } from "react";
import type { Credential } from "@/data/credential";
import type { DemoRole } from "@/data/mock-accounts";
import { emptyAccess } from "@/data/permissions";
import type { Access } from "@/data/permissions";
import {
  usersStorageKey,
  usersChangedEvent,
  readUserChanges,
  getUsers,
  getUserAccess,
} from "./user-store";
import {
  getDashboardPath as permissionHome,
  canAccessDashboardPath as permissionAllowsPath,
} from "./permissions";

const storageKey = "credential";
const sessionChanged = "nexus-demo-session-changed";

export function getDashboardPath(role: DemoRole, access: Access = emptyAccess) {
  return permissionHome(role, access);
}
export function canAccessDashboardPath(
  role: DemoRole,
  path: string,
  access: Access = emptyAccess,
) {
  return permissionAllowsPath(role, access, path);
}
export function getSafeReturnPath(
  role: DemoRole,
  requestedPath: string | null,
  access: Access = emptyAccess,
) {
  return requestedPath && canAccessDashboardPath(role, requestedPath, access)
    ? requestedPath
    : getDashboardPath(role, access);
}

export function readCredential(snapshot: string | null): Credential | null {
  if (!snapshot) return null;
  try {
    const value = JSON.parse(snapshot) as Partial<Credential> | null;
    if (
      !value ||
      typeof value.token !== "string" ||
      !value.token ||
      typeof value.email !== "string"
    )
      return null;
    return value as Credential;
  } catch {
    return null;
  }
}

export function resolveDemoSession(
  sessionSnapshot: string,
  userSnapshot: string,
) {
  const stored = readCredential(sessionSnapshot);
  const changes = readUserChanges(userSnapshot);
  const user = stored
    ? getUsers(changes).find(
        (user) => user.email === stored.email && user.status === "Active",
      )
    : undefined;
  if (!stored || !user) return { credential: null, access: emptyAccess };
  // Always use the current saved account role and access, never stale session claims.
  const credential: Credential = {
    token: stored.token,
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return { credential, access: getUserAccess(user.email, changes) };
}

function getSnapshot() {
  try {
    return JSON.stringify([
      localStorage.getItem(storageKey) ?? "",
      localStorage.getItem(usersStorageKey) ?? "",
    ]);
  } catch {
    return '["", ""]';
  }
}
function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (
      event.key === storageKey ||
      event.key === usersStorageKey ||
      event.key === null
    )
      listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(sessionChanged, listener);
  window.addEventListener(usersChangedEvent, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(sessionChanged, listener);
    window.removeEventListener(usersChangedEvent, listener);
  };
}
export function useDemoSession() {
  const snapshot = useSyncExternalStore<string | null>(
    subscribe,
    getSnapshot,
    () => null,
  );
  const [sessionSnapshot, userSnapshot] = snapshot
    ? (JSON.parse(snapshot) as [string, string])
    : ["", ""];
  return {
    ...resolveDemoSession(sessionSnapshot, userSnapshot),
    isReady: snapshot !== null,
  };
}
export function saveDemoSession(credential: Credential) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(credential));
  } catch {
    throw new Error("This browser could not save your demo session.");
  }
  window.dispatchEvent(new Event(sessionChanged));
}
export function signOutDemo() {
  localStorage.removeItem(storageKey);
  localStorage.removeItem("returnPath");
  window.dispatchEvent(new Event(sessionChanged));
}
