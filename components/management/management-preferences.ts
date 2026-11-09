import { useSyncExternalStore } from "react";
import type { ManagementRole } from "./ManagementShell";

export const auditTimeZones = {
  local: "Browser time zone",
  UTC: "UTC",
  "Asia/Bangkok": "Bangkok (UTC+7)",
} as const;

type Preferences = {
  density: "standard" | "compact";
  timeZone: keyof typeof auditTimeZones;
};

export const defaultPreferences: Preferences = { density: "standard", timeZone: "local" };
const storagePrefix = "nexus-management-preferences:";
const changeEvent = "nexus-management-preferences-updated";

function getSnapshot(role: ManagementRole) {
  try {
    return localStorage.getItem(storagePrefix + role) ?? "";
  } catch {
    return "";
  }
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === null || event.key.startsWith(storagePrefix)) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, listener);
  };
}

export function useManagementPreferences(role: ManagementRole): Preferences {
  const snapshot = useSyncExternalStore(subscribe, () => getSnapshot(role), () => "");
  if (!snapshot) return defaultPreferences;

  try {
    const saved: Partial<Preferences> | null = JSON.parse(snapshot);
    const timeZone = saved?.timeZone;
    return {
      density: saved?.density === "compact" ? "compact" : "standard",
      timeZone: timeZone && Object.hasOwn(auditTimeZones, timeZone) ? timeZone : defaultPreferences.timeZone,
    };
  } catch {
    return defaultPreferences;
  }
}

export function saveManagementPreferences(role: ManagementRole, preferences: Preferences) {
  try {
    localStorage.setItem(storagePrefix + role, JSON.stringify(preferences));
  } catch {
    return false;
  }
  window.dispatchEvent(new Event(changeEvent));
  return true;
}
