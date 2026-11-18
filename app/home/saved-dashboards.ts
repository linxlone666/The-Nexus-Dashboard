import { useEffect, useSyncExternalStore } from "react";
import { isMobileDashboard } from "./dashboard-device";
import { normalizeDashboardLayout } from "./dashboard-layout";
import type { DashboardLayout } from "./dashboard-layout";

export type SavedDashboard = {
  id: string;
  name: string;
  layout?: DashboardLayout;
  savedAt?: number;
};

const key = "nexus-home-dashboards-v1";
const changedEvent = "nexus-home-dashboards-changed";
const starterDashboards: SavedDashboard[] = [
  { id: "my-view", name: "My view" },
  { id: "alarm-response", name: "Alarm response" },
];

function readSnapshot(scope: string) {
  try {
    return scope ? localStorage.getItem(scope) : null;
  } catch {
    return null;
  }
}

function parseDashboards(snapshot: string | null): SavedDashboard[] {
  if (snapshot === null) return starterDashboards;

  try {
    const dashboards: unknown = JSON.parse(snapshot);
    if (Array.isArray(dashboards)) {
      return dashboards
        .filter(
          (entry) =>
            entry &&
            typeof entry.id === "string" &&
            typeof entry.name === "string",
        )
        .map((entry: SavedDashboard) =>
          entry.layout
            ? { ...entry, layout: normalizeDashboardLayout(entry.layout) }
            : entry,
        );
    }
  } catch {
    return starterDashboards;
  }

  return starterDashboards;
}

function subscribe(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key?.startsWith(key) || event.key === null) callback();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(changedEvent, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changedEvent, callback);
  };
}

export function useSavedDashboards(scope: string) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => readSnapshot(scope) ?? readOwnedLegacy(scope),
    () => null,
  );
  useEffect(() => {
    if (!scope || isMobileDashboard()) return;
    try {
      const legacy = localStorage.getItem(key);
      const ownerKey = key + "-legacy-owner";
      if (legacy === null || localStorage.getItem(scope) !== null) return;
      const owner = localStorage.getItem(ownerKey);
      if (owner && owner !== scope) return;
      localStorage.setItem(ownerKey, scope);
      localStorage.setItem(scope, legacy);
      window.dispatchEvent(new Event(changedEvent));
    } catch {
      // Keep the default layout when browser storage is unavailable.
    }
  }, [scope]);
  return parseDashboards(snapshot);
}

function writeDashboards(scope: string, dashboards: SavedDashboard[]) {
  if (isMobileDashboard()) throw new Error("Mobile dashboards are view-only.");
  if (!scope) throw new Error("Choose a workspace before saving.");
  localStorage.setItem(scope, JSON.stringify(dashboards));
  window.dispatchEvent(new Event(changedEvent));
}

export function addDashboard(
  scope: string,
  name: string,
  layout: DashboardLayout,
) {
  const dashboards = parseDashboards(readSnapshot(scope));
  const dashboard = {
    id: crypto.randomUUID(),
    name,
    layout: normalizeDashboardLayout(layout),
    savedAt: Date.now(),
  };
  writeDashboards(scope, [...dashboards, dashboard]);
  return dashboard;
}

export function deleteDashboard(scope: string, id: string) {
  const dashboards = parseDashboards(readSnapshot(scope));
  writeDashboards(
    scope,
    dashboards.filter((dashboard) => dashboard.id !== id),
  );
}

export function updateDashboard(
  scope: string,
  id: string,
  name: string,
  layout: DashboardLayout,
) {
  const dashboards = parseDashboards(readSnapshot(scope));
  if (!dashboards.some((dashboard) => dashboard.id === id)) {
    throw new Error("Dashboard no longer exists.");
  }

  writeDashboards(
    scope,
    dashboards.map((dashboard) =>
      dashboard.id === id
        ? {
            ...dashboard,
            name,
            layout: normalizeDashboardLayout(layout),
            savedAt: Date.now(),
          }
        : dashboard,
    ),
  );
}

export function dashboardScope(email: string, siteId: string) {
  return [key, email, siteId].map(encodeURIComponent).join(":");
}

function readOwnedLegacy(scope: string) {
  if (!scope) return null;
  try {
    return localStorage.getItem(key + "-legacy-owner") === scope
      ? localStorage.getItem(key)
      : null;
  } catch {
    return null;
  }
}
