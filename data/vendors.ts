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

export const sampleVendors: Vendor[] = [
  {
    id: "demo-security",
    name: "Demo Security",
    status: "Connected",
    url: "https://demo-security.example/v1",
    authentication: "API key",
    reference: "demo-security-key",
    sources: [
      { source: "lobby-camera", type: "CCTV", name: "Lobby camera" },
      { source: "loading-dock", type: "Alarm", name: "Loading dock" },
      { source: "parking-count", type: "", name: "Parking count" },
    ],
    lastSync: "09:32",
  },
  {
    id: "cctv-systems",
    name: "CCTV Systems",
    status: "Connected",
    url: "https://cctv-systems.example/v1",
    authentication: "API key",
    reference: "cctv-systems-key",
    sources: [
      { source: "north-camera", type: "CCTV", name: "North camera" },
      { source: "south-camera", type: "CCTV", name: "South camera" },
    ],
    lastSync: "09:41",
  },
  {
    id: "access-control",
    name: "Access Control",
    status: "Disconnected",
    url: "https://access-control.example/v1",
    authentication: "API key",
    reference: "",
    sources: [
      { source: "main-entrance", type: "Access", name: "Main entrance" },
    ],
    lastSync: "Yesterday",
  },
  {
    id: "building-management",
    name: "Building Management",
    status: "Error",
    url: "https://building.example/v1",
    authentication: "API key",
    reference: "",
    sources: [
      { source: "building-alarm", type: "Alarm", name: "Building alarm" },
    ],
    lastSync: "08:54",
    testMessage:
      "Demo connection failed. Add a credential reference and retry.",
  },
];
