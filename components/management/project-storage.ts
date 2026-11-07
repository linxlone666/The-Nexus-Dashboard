import { useSyncExternalStore } from "react";
import { projects } from "./management-data";

const storageKey = "nexus-initialized-projects";
const storageEvent = "nexus-projects-updated";

export type InitializedProject = {
  key: string;
  name: string;
  organization: string;
  description: string;
  environment: string;
  owner: string;
  vendor: string;
  baseUrl: string;
  authentication: string;
  credentialReference: string;
  mappings: { source: string; type: string; name: string }[];
  sites: null;
  status: "Onboarding";
  updated: string;
};

function getSnapshot() {
  try {
    return localStorage.getItem(storageKey) ?? "[]";
  } catch {
    return "[]";
  }
}

function readProjects(snapshot: string): InitializedProject[] {
  try {
    const value: unknown = JSON.parse(snapshot);
    return Array.isArray(value) ? value.filter((project) =>
      typeof project?.name === "string" && typeof project?.key === "string" &&
      typeof project?.organization === "string" && Array.isArray(project?.mappings),
    ) : [];
  } catch {
    return [];
  }
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

export function useProjects() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  return [...readProjects(snapshot), ...projects];
}

export function saveProject(project: InitializedProject) {
  const saved = readProjects(getSnapshot());
  if ([...saved, ...projects].some(({ key }) => key === project.key)) {
    return "That project key is already in use.";
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify([project, ...saved]));
  } catch {
    return "This browser could not save the project. Check your browser storage settings and try again.";
  }
  window.dispatchEvent(new Event(storageEvent));
}
