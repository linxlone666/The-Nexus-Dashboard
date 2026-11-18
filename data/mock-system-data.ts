import { demoDates } from "./demo-dates";
import { getOperationCounts } from "./mock-operation-records";
import { getSecurityCounts } from "./mock-security-events";
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
const dates = demoDates;

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
      headquarters: dates.map((date) => getOperationCounts(date).attendance),
      "north-campus": dates.map((date) => getOperationCounts(date).attendance),
      "muang-thong": dates.map((date) => getOperationCounts(date).attendance),
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
      headquarters: dates.map((date) => getOperationCounts(date).visitors),
      "north-campus": dates.map((date) => getOperationCounts(date).visitors),
      "muang-thong": dates.map((date) => getOperationCounts(date).visitors),
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
      headquarters: [[5, 1, 3], [5, 1, 2], [5, 1, 2]],
      "north-campus": [[5, 1, 2], [5, 1, 3], [5, 1, 2]],
      "muang-thong": [[5, 1, 3], [5, 1, 3], [5, 1, 2]],
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
      headquarters: dates.map((date) => getOperationCounts(date).crm),
      "north-campus": dates.map((date) => getOperationCounts(date).crm),
      "muang-thong": dates.map((date) => getOperationCounts(date).crm),
    },
  },
  {
    id: "cctv",
    name: "CCTV",
    metrics: [
      { key: "totalCameras", label: "Total cameras", unit: "count" },
      { key: "online", label: "Online cameras", unit: "count" },
      { key: "motionEvents", label: "Camera events", unit: "count" },
    ],
    samples: {
      headquarters: dates.map((date) => getSecurityCounts(date).cctv),
      "north-campus": dates.map((date) => getSecurityCounts(date).cctv),
      "muang-thong": dates.map((date) => getSecurityCounts(date).cctv),
    },
  },
  {
    id: "alarms",
    name: "Alarms and Incidents",
    metrics: [
      { key: "raised", label: "Tracked incidents", unit: "count" },
      { key: "critical", label: "Unresolved critical incidents", unit: "count" },
      { key: "resolved", label: "Resolved incidents", unit: "count" },
    ],
    samples: {
      headquarters: dates.map((date) => getSecurityCounts(date).alarms),
      "north-campus": dates.map((date) => getSecurityCounts(date).alarms),
      "muang-thong": dates.map((date) => getSecurityCounts(date).alarms),
    },
  },
  {
    id: "access",
    name: "Access Control",
    metrics: [
      { key: "granted", label: "Access granted", unit: "count" },
      { key: "denied", label: "Access denied", unit: "count" },
      { key: "activeDoors", label: "Doors with events", unit: "count" },
    ],
    samples: {
      headquarters: dates.map((date) => getOperationCounts(date).access),
      "north-campus": dates.map((date) => getOperationCounts(date).access),
      "muang-thong": dates.map((date) => getOperationCounts(date).access),
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
