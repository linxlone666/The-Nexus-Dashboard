import { useSyncExternalStore } from "react";

export type VendorSource = { source: string; type: string; name: string };
export type VendorStatus = "Connected" | "Disconnected" | "Error";

export type Vendor = {
  id: string;
  name: string;
  status: VendorStatus;
  url: string;
  authentication: string;
  reference: string;
  sources: VendorSource[];
  lastSync: string;
  testMessage?: string;
};

const sampleVendors: Vendor[] = [
  {
    id: "demo-security", name: "Demo Security", status: "Connected",
    url: "https://demo-security.example/v1", authentication: "API key", reference: "demo-security-key",
    sources: [
      { source: "lobby-camera", type: "CCTV", name: "Lobby camera" },
      { source: "loading-dock", type: "Alarm", name: "Loading dock" },
      { source: "parking-count", type: "", name: "Parking count" },
    ],
    lastSync: "09:32",
  },
  {
    id: "cctv-systems", name: "CCTV Systems", status: "Connected",
    url: "https://cctv-systems.example/v1", authentication: "API key", reference: "cctv-systems-key",
    sources: [
      { source: "north-camera", type: "CCTV", name: "North camera" },
      { source: "south-camera", type: "CCTV", name: "South camera" },
    ],
    lastSync: "09:41",
  },
  {
    id: "access-control", name: "Access Control", status: "Disconnected",
    url: "https://access-control.example/v1", authentication: "API key", reference: "",
    sources: [{ source: "main-entrance", type: "Access", name: "Main entrance" }],
    lastSync: "Yesterday",
  },
  {
    id: "building-management", name: "Building Management", status: "Error",
    url: "https://building.example/v1", authentication: "API key", reference: "",
    sources: [{ source: "building-alarm", type: "Alarm", name: "Building alarm" }],
    lastSync: "08:54",
    testMessage: "Demo connection failed. Add a credential reference and retry.",
  },
];

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
    return Array.isArray(value) ? value.filter((vendor) =>
      typeof vendor?.id === "string" && typeof vendor?.name === "string" &&
      typeof vendor?.url === "string" && Array.isArray(vendor?.sources),
    ) : [];
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
  const changes = read(snapshot());
  const duplicate = [...sampleVendors, ...changes].some((entry) =>
    entry.id !== vendor.id && entry.name.toLowerCase() === vendor.name.toLowerCase(),
  );
  if (duplicate) return "A vendor with that name already exists.";

  try {
    localStorage.setItem(key, JSON.stringify([...changes.filter((entry) => entry.id !== vendor.id), vendor]));
  } catch {
    return "This browser could not save the vendor.";
  }
  window.dispatchEvent(new Event(changed));
}

export function parseVendorEndpoint(value: string) {
  try {
    const url = new URL(value.trim());
    if (["http:", "https:"].includes(url.protocol) &&
      !url.username && !url.password && !url.search && !url.hash) return url;
  } catch {
    return undefined;
  }
}
