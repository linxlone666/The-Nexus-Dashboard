"use client";

import { useSyncExternalStore } from "react";
import { readManagement, useManagement } from "./management-store";

const siteKey = "nexus-selected-site";
const siteChanged = "nexus-selected-site-changed";

function readSiteId() {
  try {
    return sessionStorage.getItem(siteKey);
  } catch {
    return null;
  }
}

function subscribe(callback: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === siteKey || event.key === null) callback();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(siteChanged, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(siteChanged, callback);
  };
}

export function useSelectedWorkSite() {
  const siteId = useSyncExternalStore(subscribe, readSiteId, () => null);
  return useManagement().sites.find(
    ({ id, active }) => id === siteId && active,
  );
}

export function selectWorkSite(id: string) {
  if (!readManagement().sites.some((site) => site.id === id && site.active))
    throw new Error("Unknown work site.");
  sessionStorage.setItem(siteKey, id);
  window.dispatchEvent(new Event(siteChanged));
}

export function clearWorkSite() {
  sessionStorage.removeItem(siteKey);
  window.dispatchEvent(new Event(siteChanged));
}
