"use client";

import { useSyncExternalStore } from "react";

const storageKey = "nexus-sidebar-collapsed";
const changedEvent = "nexus-sidebar-changed";
let temporaryValue: boolean | null = null;

function getSnapshot() {
  if (temporaryValue !== null) return temporaryValue;
  try {
    return localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) {
      temporaryValue = null;
      listener();
    }
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changedEvent, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changedEvent, listener);
  };
}

export function useCollapsedSidebar() {
  const collapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  function toggleSidebar() {
    const nextValue = !getSnapshot();
    try {
      localStorage.setItem(storageKey, String(nextValue));
      temporaryValue = null;
    } catch {
      temporaryValue = nextValue;
    }
    window.dispatchEvent(new Event(changedEvent));
  }
  return { collapsed, toggleSidebar };
}
