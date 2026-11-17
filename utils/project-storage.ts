import { useSyncExternalStore } from "react";
import { demoProjects } from "@/data/management";

// Older dashboard branches saved project summaries without individual site IDs.
const key = "nexus-initialized-projects";

function readSnapshot() {
  try {
    return localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function subscribe(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) callback();
  }
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

function readProjects(snapshot: string) {
  const projects = new Map<
    string,
    { id: string; name: string; legacySiteCount: number }
  >(demoProjects.map((project) => [project.id, project]));
  try {
    const older = JSON.parse(snapshot);
    if (Array.isArray(older)) {
      for (const project of older) {
        if (
          typeof project?.key !== "string" ||
          !project.key ||
          typeof project.name !== "string" ||
          projects.has(project.key)
        )
          continue;
        projects.set(project.key, {
          id: project.key,
          name: project.name,
          legacySiteCount:
            Number.isSafeInteger(project.sites) && project.sites > 0
              ? project.sites
              : 0,
        });
      }
    }
  } catch {
    // Keep the fixtures when the old storage key is absent or unreadable.
  }
  return [...projects.values()];
}

export function readDemoProjects() {
  return readProjects(readSnapshot());
}

export function useDemoProjects() {
  return readProjects(useSyncExternalStore(subscribe, readSnapshot, () => ""));
}
