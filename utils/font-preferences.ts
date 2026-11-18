"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useDemoProfile } from "./demo-session";

const eventName = "nexus-font-changed";
const prefix = "nexus-font:";
export const fontSizes = ["small", "standard", "large"] as const;
type FontSize = (typeof fontSizes)[number];

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}

export function useFontPreference(email?: string) {
  const size = useSyncExternalStore(subscribe, (): FontSize => {
    try {
      const saved = email && localStorage.getItem(prefix + email);
      return saved === "small" || saved === "large" ? saved : "standard";
    } catch {
      return "standard";
    }
  }, () => "standard" as FontSize);
  return size;
}

export function saveFontPreference(email: string, size: FontSize) {
  localStorage.setItem(prefix + email, size);
  window.dispatchEvent(new Event(eventName));
}

export function ApplyFontPreference() {
  const profile = useDemoProfile();
  const size = useFontPreference(profile?.email);
  useEffect(() => {
    document.documentElement.dataset.fontSize = size;
  }, [size]);
  return null;
}
