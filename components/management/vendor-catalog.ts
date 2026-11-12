import { currentUserCan } from "@/utils/user-store";
import { useSyncExternalStore } from "react";
import { sampleVendors } from "@/data/vendors";
import type { Vendor } from "@/data/vendors";

const key = "nexus-vendor-catalog";
const changed = "nexus-vendors-updated";

function snapshot() {
  try {
    return localStorage.getItem(key) ?? "[]";
  } catch {
    return "[]";
  }
}

function read(snapshotValue: string): Vendor[] {
  try {
    const value: unknown = JSON.parse(snapshotValue);
    return Array.isArray(value)
      ? value.filter(
          (vendor) =>
            typeof vendor?.id === "string" &&
            typeof vendor?.name === "string" &&
            typeof vendor?.url === "string" &&
            Array.isArray(vendor?.sources),
        )
      : [];
  } catch {
    return [];
  }
}

function subscribe(listener: () => void) {
  function onStorage(event: StorageEvent) {
    if (event.key === key || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(changed, listener);
  };
}

export function useVendors() {
  const changes = read(useSyncExternalStore(subscribe, snapshot, () => "[]"));
  const catalog = new Map(sampleVendors.map((vendor) => [vendor.id, vendor]));
  for (const vendor of changes) catalog.set(vendor.id, vendor);
  return [...catalog.values()];
}

export function saveVendor(vendor: Vendor) {
  if (!currentUserCan("Manage Vendors"))
    return "You do not have permission to manage vendors.";
  const changes = read(snapshot());
  const duplicate = [...sampleVendors, ...changes].some(
    (entry) =>
      entry.id !== vendor.id &&
      entry.name.toLowerCase() === vendor.name.toLowerCase(),
  );
  if (duplicate) return "A vendor with that name already exists.";

  try {
    localStorage.setItem(
      key,
      JSON.stringify([
        ...changes.filter((entry) => entry.id !== vendor.id),
        vendor,
      ]),
    );
  } catch {
    return "This browser could not save the vendor.";
  }
  window.dispatchEvent(new Event(changed));
}

export function parseVendorEndpoint(value: string) {
  try {
    const url = new URL(value.trim());
    if (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    )
      return url;
  } catch {
    return undefined;
  }
}
