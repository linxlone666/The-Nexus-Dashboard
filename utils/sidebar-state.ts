"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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

function useCollapsedSidebar() {
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

export function useSidebarNavigation() {
  const { collapsed, toggleSidebar } = useCollapsedSidebar();
  const [hovered, setHovered] = useState(false);
  const timer = useRef<number | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  function clearTimer() {
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = null;
  }
  useEffect(() => clearTimer, [collapsed]);
  function closePreview() {
    clearTimer();
    setHovered(false);
  }
  function togglePinned() {
    closePreview();
    toggleSidebar();
  }
  const previewing = collapsed && hovered;
  return {
    collapsed,
    previewing,
    railProps: {
      onPointerEnter(event: React.PointerEvent<HTMLElement>) {
        if (
          !collapsed ||
          timer.current !== null ||
          event.pointerType === "touch" ||
          !window.matchMedia(
            "(min-width: 761px) and (any-hover: hover) and (any-pointer: fine)",
          ).matches
        )
          return;
        timer.current = window.setTimeout(() => {
          timer.current = null;
          setHovered(true);
        }, 500);
      },
      onPointerLeave: closePreview,
      onPointerCancel: closePreview,
      onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
        if (
          event.key !== "Escape" ||
          (collapsed && !previewing && timer.current === null)
        )
          return;
        closePreview();
        if (!collapsed) toggleSidebar();
        toggle.current?.focus();
      },
    },
    toggleProps: {
      ref: toggle,
      onClick: togglePinned,
      "aria-expanded": !collapsed || previewing,
      "aria-pressed": !collapsed,
    },
  };
}
