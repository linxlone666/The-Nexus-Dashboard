"use client";

import { useSyncExternalStore } from "react";
import type { Credential } from "@/data/credential";
import type { DemoRole } from "@/data/mock-accounts";

const storageKey = "credential";
const sessionChanged = "nexus-demo-session-changed";

export function getDashboardPath(role: DemoRole) {
  const dashboards = {
    User: "/dashboard",
    Admin: "/admin/overview",
    Superadmin: "/superadmin/overview",
  };
  return dashboards[role];
}

export function canAccessDashboardPath(role: DemoRole, path: string) {
  const section = {
    User: "/dashboard",
    Admin: "/admin",
    Superadmin: "/superadmin",
  }[role];
  const pathname = path.split(/[?#]/)[0];
  return pathname === section || pathname.startsWith(section + "/");
}

export function getSafeReturnPath(
  role: DemoRole,
  requestedPath: string | null,
) {
  if (requestedPath && canAccessDashboardPath(role, requestedPath))
    return requestedPath;
  return getDashboardPath(role);
}

export function readCredential(snapshot: string | null): Credential | null {
  if (!snapshot) return null;
  try {
    const value: unknown = JSON.parse(snapshot);
    if (!value || typeof value !== "object") return null;
    const session = value as Partial<Credential>;
    const validRole =
      session.role === "User" ||
      session.role === "Admin" ||
      session.role === "Superadmin";
    if (
      typeof session.token !== "string" ||
      !session.token ||
      typeof session.email !== "string" ||
      typeof session.name !== "string" ||
      !validRole
    )
      return null;
    return session as Credential;
  } catch {
    return null;
  }
}

function getSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? "";
  } catch {
    return "";
  }
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(sessionChanged, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(sessionChanged, listener);
  };
}

export function useDemoSession() {
  // null means the browser has not hydrated yet; an empty string means signed out.
  const snapshot = useSyncExternalStore<string | null>(
    subscribe,
    getSnapshot,
    () => null,
  );
  return { credential: readCredential(snapshot), isReady: snapshot !== null };
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
