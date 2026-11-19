"use client";

import { demoEnabled } from "./demo-mode";
import { useSyncExternalStore } from "react";
import { getDemoProfile } from "@/data/credential";
import type { Credential } from "@/data/credential";
import { clearWorkSite } from "./selected-work-site";
import { managementRequest, demoCredential, subscribeManagement } from "./management-store";

const storageKey = "credential";
const changedEvent = "nexus-credential-changed";

function readStorage() {
  try {
    return sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function profileFromStorage(raw: string | null) {
  if (!raw) return null;

  try {
    const credential = JSON.parse(raw);
    if (
      typeof credential?.email === "string" &&
      typeof credential.token === "string" &&
      credential.token
    ) {
      return getDemoProfile(credential.email) ?? null;
    }
  } catch {
    return null;
  }

  return null;
}

function subscribe(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) callback();
  }

  const unsubscribeManagement = subscribeManagement(callback);
  window.addEventListener("storage", onStorage);
  window.addEventListener(changedEvent, callback);
  return () => {
    unsubscribeManagement();
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changedEvent, callback);
  };
}

export function readDemoProfile() {
  return demoEnabled ? profileFromStorage(readStorage()) : null;
}

export function useDemoProfile() {
  const snapshot = useSyncExternalStore(
    subscribe,
    readProfileSnapshot,
    () => undefined,
  );
  return snapshot === undefined
    ? undefined
    : (JSON.parse(snapshot) as ReturnType<typeof readDemoProfile>);
}

function readProfileSnapshot() {
  return JSON.stringify(readDemoProfile());
}

export function saveDemoSession(credential: Credential) {
  if (!demoEnabled) throw new Error("Demo sign-in is disabled.");
  clearWorkSite();
  sessionStorage.setItem(storageKey, JSON.stringify(credential));
  window.dispatchEvent(new Event(changedEvent));
}

export function signOutDemoSession() {
  const token = demoCredential()?.token;
  if (token) void managementRequest({ action: "logout" }, token).catch(() => {});
  sessionStorage.removeItem(storageKey);
  window.dispatchEvent(new Event(changedEvent));
  clearWorkSite();
}
