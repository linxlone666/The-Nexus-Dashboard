import { useSyncExternalStore } from "react";
import { projects } from "@/data/projects";
import { useDemoSession } from "@/utils/demo-session";
import { getProjectLevel } from "@/utils/permissions";
import {
  currentUserCan,
  getCurrentUser,
  getUserAccess,
} from "@/utils/user-store";
import { recordAuditActivity } from "./audit-log";

const storageKey = "nexus-initialized-projects";
const descriptionsKey = "nexus-project-descriptions";
const storageEvent = "nexus-projects-updated";

export type InitializedProject = {
  key: string;
  name: string;
  organization: string;
  description: string;
  environment: string;
  owner: string;
  vendor: string;
  vendorId?: string;
  baseUrl: string;
  authentication: string;
  credentialReference: string;
  mappings: { source: string; type: string; name: string }[];
  sites: null;
  status: "Onboarding";
  updated: string;
};
type ProjectEdit = { description: string; updated: string };

// Read persisted project data with a safe fallback for restricted browser storage.
function readStored(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

// Validate the minimum fields needed before using records from local storage.
function readProjects(snapshot: string): InitializedProject[] {
  try {
    const parsed: unknown = JSON.parse(snapshot);
    return Array.isArray(parsed)
      ? parsed.filter(
          (project) =>
            typeof project?.key === "string" &&
            typeof project?.name === "string" &&
            typeof project?.organization === "string" &&
            Array.isArray(project?.mappings),
        )
      : [];
  } catch {
    return [];
  }
}

// Keep only well-formed description edits keyed by project identifier.
function readEdits(snapshot: string): Record<string, ProjectEdit> {
  try {
    const parsed = JSON.parse(snapshot);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
      return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => {
        const edit = value as Partial<ProjectEdit> | null;
        return (
          edit &&
          typeof edit.description === "string" &&
          typeof edit.updated === "string"
        );
      }),
    ) as Record<string, ProjectEdit>;
  } catch {
    return {};
  }
}

// Combine both storage records into one stable external-store snapshot.
function getSnapshot() {
  return JSON.stringify([
    readStored(storageKey, "[]"),
    readStored(descriptionsKey, "{}"),
  ]);
}

// Listen for updates from other tabs and writes made by this module.
function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (
      event.key === storageKey ||
      event.key === descriptionsKey ||
      event.key === null
    )
      listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(storageEvent, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(storageEvent, listener);
  };
}

// Combine built-in projects with created projects and apply saved description edits.
function combineProjects(projectSnapshot: string, editSnapshot: string) {
  const edits = readEdits(editSnapshot);
  return [...readProjects(projectSnapshot), ...projects].map((project) => ({
    ...project,
    description:
      edits[project.key]?.description ??
      ("description" in project ? project.description : ""),
    updated: edits[project.key]?.updated ?? project.updated,
  }));
}
export type ProjectRecord = ReturnType<typeof combineProjects>[number];

// Share project data with React and expose only records the current session can access.
export function useProjects() {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => '["[]", "{}"]',
  );
  const [projectSnapshot, editSnapshot] = JSON.parse(snapshot) as [
    string,
    string,
  ];
  return combineProjects(projectSnapshot, editSnapshot);
}
export function useAccessibleProjects() {
  const projects = useProjects();
  const { credential, access } = useDemoSession();
  return projects.filter((project) =>
    Boolean(getProjectLevel(credential?.role, access, project)),
  );
}

// Save a new project after enforcing role access and unique project keys.
export function saveProject(project: InitializedProject) {
  if (
    getCurrentUser()?.role !== "Superadmin" ||
    !currentUserCan("Access Projects")
  )
    return "Only Superadmin can create projects.";
  const saved = readProjects(readStored(storageKey, "[]"));
  if ([...saved, ...projects].some((entry) => entry.key === project.key))
    return "That project key is already in use.";
  try {
    localStorage.setItem(storageKey, JSON.stringify([project, ...saved]));
  } catch {
    return "This browser could not save the project.";
  }
  window.dispatchEvent(new Event(storageEvent));
}

// Allow editors to update a bounded project description and record the change.
export function updateProjectDescription(
  projectKey: string,
  description: string,
) {
  const actor = getCurrentUser();
  const records = combineProjects(
    readStored(storageKey, "[]"),
    readStored(descriptionsKey, "{}"),
  );
  const project = records.find((project) => project.key === projectKey);
  if (
    !actor ||
    !project ||
    getProjectLevel(actor.role, getUserAccess(actor.email), project) !==
      "Editor"
  )
    return "Editor access is required to change this project.";
  if (description.length > 500)
    return "Keep the description within 500 characters.";
  const edits = readEdits(readStored(descriptionsKey, "{}"));
  edits[projectKey] = {
    description: description.trim(),
    updated: new Date().toISOString().slice(0, 10),
  };
  try {
    localStorage.setItem(descriptionsKey, JSON.stringify(edits));
  } catch {
    return "This browser could not save the project.";
  }
  window.dispatchEvent(new Event(storageEvent));
  recordAuditActivity({
    role: actor.role,
    category: "Projects",
    action: "Project description updated",
    target: project.name,
    outcome: "Success",
  });
}
