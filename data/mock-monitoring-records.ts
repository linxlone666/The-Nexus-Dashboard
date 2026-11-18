import { getManagedSiteDataset } from "./mock-system-data";
import type { SystemId, WorkSiteId } from "./mock-system-data";
import type { ManagedSite } from "./management";

export const demoCameraFootage = {
  entrance: { video: "/cctv/lobby.webm", poster: "/cctv/lobby.jpg" },
  vehicle: { video: "/cctv/loading-dock.webm", poster: "/cctv/loading-dock.jpg" },
} as const;

const sampleAreas = {
  headquarters: {
    prefix: "HQ",
    entry: "Main lobby",
    parking: "Basement parking",
    team: "Facilities",
    project: "Lobby renovation",
  },
  "north-campus": {
    prefix: "NC",
    entry: "Campus reception",
    parking: "North lot",
    team: "Campus Operations",
    project: "North lot expansion",
  },
  "muang-thong": {
    prefix: "MT",
    entry: "Gate A",
    parking: "Contractor parking",
    team: "Site Operations",
    project: "Warehouse fit-out",
  },
} satisfies Record<
  WorkSiteId,
  {
    prefix: string;
    entry: string;
    parking: string;
    team: string;
    project: string;
  }
>;

function getSampleArea(site: ManagedSite) {
  const id =
    site.source?.kind === "sample" ? site.source.sampleSiteId : site.id;
  return Object.hasOwn(sampleAreas, id)
    ? sampleAreas[id as WorkSiteId]
    : undefined;
}

export function getCameraMonitoring(site: ManagedSite) {
  const area = getSampleArea(site);
  const latest = getManagedSiteDataset(site, "cctv")?.rows.at(-1);
  if (!area || !latest) return undefined;

  const cameras = [
    {
      id: area.prefix + "-CAM-01",
      name: area.entry,
      status: "Online",
      footage: demoCameraFootage.entrance,
    },
    {
      id: area.prefix + "-CAM-02",
      name: area.parking,
      status: "Online",
      footage: demoCameraFootage.vehicle,
    },
    {
      id: area.prefix + "-CAM-03",
      name: "Service entrance",
      status: "Offline",
      footage: null,
    },
  ] as const;
  const events = [
    {
      time: "10:46",
      cameraId: cameras[0].id,
      name: "Motion detected",
      status: "Reviewed",
    },
    {
      time: "10:31",
      cameraId: cameras[2].id,
      name: "Camera disconnected",
      status: "Open",
    },
    {
      time: "09:52",
      cameraId: cameras[1].id,
      name: "Vehicle entered the lot",
      status: "Recorded",
    },
    {
      time: "09:20",
      cameraId: cameras[0].id,
      name: "Person detected near entrance",
      status: "Recorded",
    },
  ];

  return { date: latest.date, cameras, events };
}

export type MonitoringRecords = {
  title: string;
  columns: string[];
  rows: (string | number)[][];
};

export function getMonitoringRecords(
  site: ManagedSite,
  systemId: Exclude<SystemId, "cctv">,
): MonitoringRecords | undefined {
  const area = getSampleArea(site);
  const latest = getManagedSiteDataset(site, systemId)?.rows.at(-1);
  if (!area || !latest) return undefined;

  const { prefix, entry, parking, team, project } = area;
  const values = latest.values;

  switch (systemId) {
    case "attendance":
      return {
        title: "Recent check-ins",
        columns: ["Employee", "Clock-in", "Checkpoint", "Status"],
        rows: [
          [prefix + "-EMP-014", "08:03", entry, "On time"],
          [prefix + "-EMP-027", "08:29", "Staff entrance", "On time"],
          [prefix + "-EMP-038", "08:47", "Staff entrance", "Late"],
        ],
      };
    case "visitors":
      return {
        title: "Visitor register",
        columns: ["Visitor pass", "Check-in", "Purpose", "Status"],
        rows: [
          [prefix + "-V014", "10:32", "Site inspection", "On site"],
          [prefix + "-V013", "10:14", "Equipment delivery", "On site"],
          [prefix + "-V009", "09:05", "Maintenance visit", "Checked out"],
        ],
      };
    case "hr":
      return {
        title: "Staffing and leave",
        columns: ["Team", "Item", "Status"],
        rows: [
          [team, "Leave requests", values.onLeave + " on leave"],
          ["Recruitment", "Open positions", values.openPositions + " open"],
          ["HR Operations", "Headcount", values.headcount + " staff"],
        ],
      };
    case "finance":
      return {
        title: "Daily financial breakdown",
        columns: ["Line item", "Amount (THB)", "Period"],
        rows: [
          ["Revenue", values.revenue, "Daily"],
          ["Operating cost", values.cost, "Daily"],
          [
            "Revenue less operating cost",
            values.revenue - values.cost,
            "Daily",
          ],
          ["Invested capital", values.capital, "To date"],
        ],
      };
    case "crm":
      return {
        title: "Sales pipeline",
        columns: ["Opportunity", "Account", "Stage"],
        rows: [
          [prefix + "-DEAL-023", "Demo Retail Group", "Proposal sent"],
          [prefix + "-DEAL-017", "Demo Logistics Co.", "Negotiation"],
          [prefix + "-DEAL-011", "Demo Facilities Ltd.", "Won"],
        ],
      };
    case "alarms":
      return {
        title: "Incident queue",
        columns: ["Time", "Incident", "Severity", "Status"],
        rows: [
          ["10:31", "Camera disconnected at service entrance", "High", "Open"],
          ["10:06", "Door held open at " + entry, "Medium", "Acknowledged"],
          ["09:48", "Motion outside scheduled hours", "Low", "Resolved"],
        ],
      };
    case "access":
      return {
        title: "Door access events",
        columns: ["Time", "Door", "Credential", "Result"],
        rows: [
          ["10:42", entry, prefix + "-B034", "Granted"],
          ["10:26", "Service entrance", prefix + "-B108", "Denied"],
          ["10:09", "Staff entrance", prefix + "-B053", "Granted"],
        ],
      };
    case "parking":
      return {
        title: "Parking occupancy",
        columns: ["Zone", "Peak occupied", "Spaces", "Available at peak"],
        rows: [
          [
            parking,
            values.peakOccupied,
            values.capacity,
            values.capacity - values.peakOccupied,
          ],
        ],
      };
    case "projects":
      return {
        title: "Project milestones",
        columns: ["Project", "Milestone", "Status"],
        rows: [
          [project, "Site survey", "Complete"],
          [
            project,
            "Installation and inspection",
            values.progress + "% complete",
          ],
          [project, "Handover and acceptance", "Upcoming"],
        ],
      };
    case "energy":
      return {
        title: "Energy balance",
        columns: ["Measurement", "Value (kWh)"],
        rows: [
          ["Electricity used", values.usage],
          ["Solar generation", values.solar],
          ["Daily energy target", values.budget],
          ["Electricity used vs. target", values.usage - values.budget],
        ],
      };
  }
}

const portfolioPrices = {
  headquarters: [
    [102, 111, 99, 108],
    [108, 113, 104, 106],
    [106, 116, 105, 114],
  ],
  "north-campus": [
    [76, 81, 74, 80],
    [80, 83, 77, 78],
    [78, 85, 78, 84],
  ],
  "muang-thong": [
    [118, 126, 116, 123],
    [123, 128, 119, 121],
    [121, 134, 120, 132],
  ],
} satisfies Record<
  WorkSiteId,
  readonly (readonly [number, number, number, number])[]
>;

export function getPortfolioPrices(site: ManagedSite) {
  const areaId =
    site.source?.kind === "sample" ? site.source.sampleSiteId : site.id;
  const finance = getManagedSiteDataset(site, "finance");
  if (!finance || !Object.hasOwn(portfolioPrices, areaId)) return [];

  return portfolioPrices[areaId as WorkSiteId].map(
    ([open, high, low, close], index) => ({
      date: finance.rows[index].date,
      open,
      high,
      low,
      close,
    }),
  );
}
