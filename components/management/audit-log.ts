import { useSyncExternalStore } from "react";
import type { DemoRole } from "@/data/mock-accounts";

import { auditCategories } from "@/data/audit";

type AuditActivity = {
  role: DemoRole;
  category: (typeof auditCategories)[number];
  action: string;
  target: string;
  outcome: "Success" | "Failed";
};

type AuditEntry = AuditActivity & { id: string; occurredAt: string };

const storageKey = "nexus-management-audit-log";
const changeEvent = "nexus-audit-log-updated";
const emptySnapshot = "[]";

// Read the persisted event list while tolerating browsers where storage is unavailable.
function getSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? emptySnapshot;
  } catch {
    return emptySnapshot;
  }
}

// Ignore malformed records so a partial or old snapshot does not break the log view.
function readEntries(snapshot: string): AuditEntry[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    return Array.isArray(parsed)
      ? parsed.filter(
          (entry) =>
            typeof entry?.id === "string" &&
            typeof entry?.action === "string" &&
            typeof entry?.target === "string" &&
            typeof entry?.occurredAt === "string" &&
            Number.isFinite(Date.parse(entry.occurredAt)),
        )
      : [];
  } catch {
    return [];
  }
}

// Subscribe to both cross-tab storage updates and same-tab writes.
function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changeEvent, listener);
  };
}

// Expose the stored activity as a React external store.
export function useAuditLog() {
  return readEntries(
    useSyncExternalStore(subscribe, getSnapshot, () => emptySnapshot),
  );
}

// Add the newest event first and cap browser storage at the latest 200 entries.
export function recordAuditActivity(activity: AuditActivity) {
  try {
    const entry = {
      ...activity,
      id: crypto.randomUUID(),
      occurredAt: new Date().toISOString(),
    };
    const entries = [entry, ...readEntries(getSnapshot())].slice(0, 200);
    localStorage.setItem(storageKey, JSON.stringify(entries));
  } catch {
    // A browser storage failure should not interrupt the original action.
    return;
  }
  window.dispatchEvent(new Event(changeEvent));
}
