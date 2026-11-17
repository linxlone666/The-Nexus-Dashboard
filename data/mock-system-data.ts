import type { ManagedSite } from "./management";
import type { workSites } from "./work-sites";

export type WorkSiteId = (typeof workSites)[number]["id"];

type Metric = {
  key: string;
  label: string;
  unit: "count" | "%" | "THB" | "kWh";
};

type DailyValues = readonly [number, number, number];
type System = {
  id: string;
  name: string;
  metrics: readonly [Metric, Metric, Metric];
  samples: Record<WorkSiteId, readonly DailyValues[]>;
};

// Fixed dates and fictional totals make the demo repeatable.
const dates = ["2026-11-09", "2026-11-10", "2026-11-11"];

const systems = [
  {
    id: "attendance",
    name: "Time Attendance",
    metrics: [
      { key: "expected", label: "Expected staff", unit: "count" },
      { key: "checkedIn", label: "Checked in", unit: "count" },
      { key: "onTime", label: "On time", unit: "count" },
    ],
    samples: {
      headquarters: [
        [180, 174, 166],
        [180, 177, 171],
        [180, 175, 169],
      ],
      "north-campus": [
        [96, 92, 87],
        [96, 94, 91],
        [96, 90, 86],
      ],
      "muang-thong": [
        [222, 214, 203],
        [222, 216, 208],
        [222, 219, 214],
      ],
    },
  },
  {
    id: "visitors",
    name: "Visitor Management (VMS)",
    metrics: [
      { key: "visits", label: "Visitor check-ins", unit: "count" },
      { key: "checkedOut", label: "Visitor check-outs", unit: "count" },
      { key: "denied", label: "Denied check-ins", unit: "count" },
    ],
    samples: {
      headquarters: [
        [55, 52, 2],
        [62, 61, 1],
        [58, 55, 0],
      ],
      "north-campus": [
        [31, 29, 1],
        [26, 26, 0],
        [34, 32, 2],
      ],
      "muang-thong": [
        [41, 38, 2],
        [46, 42, 1],
        [48, 44, 2],
      ],
    },
  },
  {
    id: "hr",
    name: "Human Resources",
    metrics: [
      { key: "headcount", label: "Headcount", unit: "count" },
      { key: "onLeave", label: "Staff on leave", unit: "count" },
      { key: "openPositions", label: "Open positions", unit: "count" },
    ],
    samples: {
      headquarters: [
        [184, 4, 6],
        [184, 4, 6],
        [185, 5, 5],
      ],
      "north-campus": [
        [99, 3, 3],
        [99, 3, 3],
        [99, 3, 2],
      ],
      "muang-thong": [
        [228, 6, 8],
        [228, 6, 8],
        [229, 7, 7],
      ],
    },
  },
  {
    id: "finance",
    name: "Finance",
    metrics: [
      { key: "revenue", label: "Daily revenue", unit: "THB" },
      { key: "cost", label: "Daily operating cost", unit: "THB" },
      { key: "capital", label: "Invested capital to date", unit: "THB" },
    ],
    samples: {
      headquarters: [
        [280000, 194000, 12100000],
        [301000, 205000, 12100000],
        [291000, 197000, 12150000],
      ],
      "north-campus": [
        [91000, 72000, 6800000],
        [104000, 75000, 6800000],
        [97000, 81000, 6840000],
      ],
      "muang-thong": [
        [410000, 298000, 28500000],
        [396000, 287000, 28500000],
        [425000, 303000, 28620000],
      ],
    },
  },
  {
    id: "crm",
    name: "Customer Relationship Management",
    metrics: [
      { key: "leads", label: "New leads", unit: "count" },
      { key: "openDeals", label: "Open deals", unit: "count" },
      { key: "wonDeals", label: "Deals won today", unit: "count" },
    ],
    samples: {
      headquarters: [
        [12, 48, 3],
        [16, 51, 4],
        [13, 52, 2],
      ],
      "north-campus": [
        [4, 19, 1],
        [6, 21, 0],
        [5, 20, 2],
      ],
      "muang-thong": [
        [8, 36, 2],
        [11, 39, 2],
        [10, 40, 3],
      ],
    },
  },
  {
    id: "cctv",
    name: "CCTV",
    metrics: [
      { key: "totalCameras", label: "Total cameras", unit: "count" },
      { key: "online", label: "Online cameras", unit: "count" },
      { key: "motionEvents", label: "Motion events", unit: "count" },
    ],
    samples: {
      headquarters: [
        [42, 40, 87],
        [42, 42, 103],
        [42, 41, 95],
      ],
      "north-campus": [
        [24, 23, 43],
        [24, 24, 54],
        [24, 23, 47],
      ],
      "muang-thong": [
        [50, 48, 132],
        [50, 49, 149],
        [50, 48, 141],
      ],
    },
  },
  {
    id: "alarms",
    name: "Alarms and Incidents",
    metrics: [
      { key: "raised", label: "Alarms raised", unit: "count" },
      { key: "critical", label: "Critical alarms", unit: "count" },
      { key: "resolved", label: "Alarms resolved", unit: "count" },
    ],
    samples: {
      headquarters: [
        [8, 1, 7],
        [6, 0, 5],
        [9, 2, 8],
      ],
      "north-campus": [
        [4, 0, 4],
        [5, 1, 4],
        [3, 0, 3],
      ],
      "muang-thong": [
        [14, 3, 10],
        [11, 2, 9],
        [13, 2, 12],
      ],
    },
  },
  {
    id: "access",
    name: "Access Control",
    metrics: [
      { key: "granted", label: "Access granted", unit: "count" },
      { key: "denied", label: "Access denied", unit: "count" },
      { key: "activeDoors", label: "Doors reporting", unit: "count" },
    ],
    samples: {
      headquarters: [
        [765, 11, 18],
        [810, 8, 18],
        [794, 10, 17],
      ],
      "north-campus": [
        [374, 4, 9],
        [382, 2, 9],
        [368, 5, 9],
      ],
      "muang-thong": [
        [941, 15, 14],
        [988, 13, 14],
        [1004, 9, 14],
      ],
    },
  },
  {
    id: "parking",
    name: "Parking",
    metrics: [
      { key: "capacity", label: "Parking spaces", unit: "count" },
      { key: "peakOccupied", label: "Peak spaces occupied", unit: "count" },
      { key: "vehicleEntries", label: "Vehicle entries", unit: "count" },
    ],
    samples: {
      headquarters: [
        [180, 151, 235],
        [180, 165, 248],
        [180, 157, 243],
      ],
      "north-campus": [
        [85, 69, 111],
        [85, 74, 126],
        [85, 67, 113],
      ],
      "muang-thong": [
        [140, 109, 181],
        [140, 118, 194],
        [140, 121, 201],
      ],
    },
  },
  {
    id: "projects",
    name: "Project Management",
    metrics: [
      { key: "openTasks", label: "Open tasks", unit: "count" },
      { key: "completedTasks", label: "Tasks completed today", unit: "count" },
      { key: "progress", label: "Project progress", unit: "%" },
    ],
    samples: {
      headquarters: [
        [42, 5, 64],
        [39, 7, 66],
        [36, 6, 68],
      ],
      "north-campus": [
        [26, 2, 53],
        [23, 4, 55],
        [21, 3, 57],
      ],
      "muang-thong": [
        [75, 8, 72],
        [69, 10, 74],
        [63, 11, 77],
      ],
    },
  },
  {
    id: "energy",
    name: "Energy Management",
    metrics: [
      { key: "usage", label: "Electricity used", unit: "kWh" },
      { key: "solar", label: "Solar generation", unit: "kWh" },
      { key: "budget", label: "Daily energy target", unit: "kWh" },
    ],
    samples: {
      headquarters: [
        [1180, 242, 1200],
        [1237, 213, 1200],
        [1156, 265, 1200],
      ],
      "north-campus": [
        [610, 92, 650],
        [641, 81, 650],
        [602, 104, 650],
      ],
      "muang-thong": [
        [1482, 160, 1500],
        [1534, 135, 1500],
        [1498, 178, 1500],
      ],
    },
  },
] as const satisfies readonly System[];

export type SystemId = (typeof systems)[number]["id"];
export const systemCatalog = systems.map(({ id, name }) => ({ id, name }));

function siteDataset(system: (typeof systems)[number], siteId: WorkSiteId) {
  const { id, name, metrics, samples } = system;
  return {
    id,
    name,
    siteId,
    metrics,
    rows: samples[siteId].map((values, index) => ({
      date: dates[index],
      values: Object.fromEntries(
        metrics.map(({ key }, metricIndex) => [key, values[metricIndex]]),
      ),
    })),
  };
}

export function getSiteDatasets(siteId: WorkSiteId) {
  return systems.map((system) => siteDataset(system, siteId));
}

export function getSiteDataset(siteId: string, systemId: SystemId) {
  const system = systems.find(({ id }) => id === systemId);
  return system && Object.hasOwn(system.samples, siteId)
    ? siteDataset(system, siteId as WorkSiteId)
    : undefined;
}

export function getManagedSiteDataset(site: ManagedSite, systemId: SystemId) {
  if (!site.source) return getSiteDataset(site.id, systemId);
  if (
    site.source.kind !== "sample" ||
    !site.source.systemIds.includes(systemId)
  )
    return undefined;
  const dataset = getSiteDataset(site.source.sampleSiteId, systemId);
  return dataset && { ...dataset, siteId: site.id };
}

export function getManagedSiteSystems(site: ManagedSite) {
  const configuredIds = site.source?.systemIds;
  return systemCatalog.filter(({ id }) =>
    configuredIds
      ? configuredIds.includes(id)
      : Boolean(getSiteDataset(site.id, id)),
  );
}
