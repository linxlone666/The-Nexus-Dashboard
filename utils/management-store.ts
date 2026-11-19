import { useSyncExternalStore } from "react";
import { initialManagementData, type DemoAccount, type ManagedSite, type ManagementData, type ManagementSettings } from "@/data/management";
import type { ManagementAction } from "./demo-server";

let current: string | null = null;
let revision = -1;
let identity = "";
let generation = 0;
const changedEvent = "nexus-management-v1-changed";
const endpoint = "/api/demo/management";
export function demoCredential() {
  try { return JSON.parse(sessionStorage.getItem("credential") ?? "null") as {email: string; token: string} | null; }
  catch { return null; }
}
export function acceptManagement(result: { data: ManagementData; revision: number }) {
  if (result.revision < revision) return;
  revision = result.revision;
  const next = JSON.stringify(result.data);
  if (next !== current) { current = next; window.dispatchEvent(new Event(changedEvent)); }
}
export async function managementRequest(body?: unknown, token = demoCredential()?.token) {
  const response = await fetch(endpoint, { method: body ? "POST" : "GET", cache: "no-store", headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && token && demoCredential()?.token === token) {
      sessionStorage.removeItem("credential");
      window.dispatchEvent(new Event("nexus-credential-changed"));
    }
    throw new Error(result.error ?? "Could not sync shared demo data.");
  }
  return result;
}
export async function refreshManagement() {
  const token = demoCredential()?.token ?? "";
  if (identity !== token) { identity = token; revision = -1; current = null; generation++; }
  if (!token) return;
  const started = generation;
  const result = await managementRequest(undefined, token);
  if (started === generation && demoCredential()?.token === token) acceptManagement(result);
}
export async function loginManagement(email: string, password: string) {
  const result = await managementRequest({ action: "login", email, password }, "");
  identity = result.credential.token;
  revision = -1;
  generation++;
  acceptManagement(result);
  return result.credential as { email: string; token: string };
}
export function subscribeManagement(callback: () => void) {
  window.addEventListener(changedEvent, callback);
  return () => window.removeEventListener(changedEvent, callback);
}
const readSnapshot = () => current;
function parse(snapshot: string | null): ManagementData { return snapshot ? JSON.parse(snapshot) : initialManagementData; }
export function readManagement() { return parse(current); }
export function useManagement() { return parse(useSyncExternalStore(subscribeManagement, readSnapshot, () => null)); }
async function mutate(input: ManagementAction) {
  const token = demoCredential()?.token;
  if (!token) throw new Error("Please sign in first.");
  const result = await managementRequest(input, token);
  if (demoCredential()?.token === token) acceptManagement(result);
}
export const saveAccount = (input: DemoAccount, existingEmail?: string) => mutate({ action: "saveAccount", args: [input, existingEmail] });
export const saveSite = (input: ManagedSite) => mutate({ action: "saveSite", args: [input] });
export const saveSettings = (settings: ManagementSettings) => mutate({ action: "saveSettings", args: [settings] });
export const removeSite = (siteId: string, confirmation: string) => mutate({ action: "removeSite", args: [siteId, confirmation] });
export const saveSitePreferences = (siteId: string, name: string, timeZone: string) => mutate({ action: "saveSitePreferences", args: [siteId, name, timeZone] });
export const saveStandardUserAccess = (email: string, assignedIds: string[], systems: NonNullable<DemoAccount["systemsBySite"]>) => mutate({ action: "saveStandardUserAccess", args: [email, assignedIds, systems] });
