import { demoCheckIns, demoVisits, demoDeals, demoAccessEvents } from "./mock-operation-records";
import { demoCameraEvents, getCameraState, getIncidentState } from "./mock-security-events";
import { latestDemoDate, formatDemoDate } from "./demo-dates";
import { getManagedSiteDataset } from "./mock-system-data";
import type { SystemId, WorkSiteId } from "./mock-system-data";
import type { ManagedSite } from "./management";

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

export function getCameraMonitoring(site: ManagedSite, date: string = latestDemoDate) {
  const area = getSampleArea(site);
  const reading = getManagedSiteDataset(site, "cctv")?.rows.find((row) => row.date === date);
  if (!area || !reading) return undefined;

  const names = [area.entry, area.parking, "Service entrance"];
  const cameras = getCameraState(date).map(({ number, status, footage, changedAt }, index) => ({
    id: area.prefix + "-CAM-" + number,
    name: names[index],
    status,
    footage: status === "Online" ? footage : null,
    changedAt,
  }));
  const events = demoCameraEvents
    .filter((event) => event.date === date)
    .map(({ camera, ...event }) => ({
      ...event,
      cameraId: cameras[camera].id,
    }));

  return { date, cameras, events };
}

type RecordTable = {
  title: string;
  columns: string[];
  rows: (string | number)[][];
};

export type MonitoringRecords = RecordTable & {
  date: string;
  coverage: "complete" | "sample" | "reading";
};

export function getMonitoringRecords(
  site: ManagedSite,
  systemId: Exclude<SystemId, "cctv">,
  date: string = latestDemoDate,
): MonitoringRecords | undefined {
  const table = buildRecords(site, systemId, date);
  if (!table) return undefined;
  const completeSystems: readonly SystemId[] = ["attendance", "visitors", "crm", "alarms", "access"];
  const coverage = completeSystems.includes(systemId)
    ? "complete"
    : systemId === "projects" ? "sample" : "reading";
  return {
    ...table,
    date,
    coverage,
    columns: ["Date", ...table.columns],
    rows: table.rows.map((row) => [formatDemoDate(date), ...row]),
  };
}

function buildRecords(
  site: ManagedSite,
  systemId: Exclude<SystemId, "cctv">,
  date: string,
): RecordTable | undefined {
  const area = getSampleArea(site);
  const reading = getManagedSiteDataset(site, systemId)?.rows.find((row) => row.date === date);
  if (!area || !reading) return undefined;
  const { prefix, entry, parking, team, project } = area;
  const values = reading.values;

  switch (systemId) {
    case "attendance":
      return {
        title: "Daily check-ins",
        columns: ["Time", "Employee", "Checkpoint", "Status"],
        rows: demoCheckIns.filter((item) => item.date === date).map(
          ({ employee, time, checkpoint, status }) => [
            time, prefix + "-" + employee, checkpoint === "entry" ? entry : checkpoint, status,
          ],
        ),
      };
    case "visitors":
      return {
        title: "Visitor register",
        columns: ["Time", "Visitor pass", "Checkpoint", "Purpose", "Status"],
        rows: demoVisits.filter((item) => item.date === date).map(
          ({ pass, time, purpose, status }) => [time, prefix + "-" + pass, entry, purpose, status],
        ),
      };
    case "hr":
      return {
        title: "End-of-day staffing",
        columns: ["Time", "Team", "Measurement", "Value"],
        rows: [
          ["23:59", team, "Staff on leave", values.onLeave],
          ["23:59", "Recruitment", "Open positions", values.openPositions],
          ["23:59", "HR Operations", "Headcount", values.headcount],
        ],
      };
    case "finance":
      return {
        title: "Daily financial breakdown",
        columns: ["Time", "Site", "Line item", "Amount (THB)", "Period"],
        rows: [
          ["23:59", site.name, "Revenue", values.revenue, "Selected day"],
          ["23:59", site.name, "Operating cost", values.cost, "Selected day"],
          ["23:59", site.name, "Revenue less operating cost", values.revenue - values.cost, "Selected day"],
          ["23:59", site.name, "Invested capital", values.capital, "To date"],
        ],
      };
    case "crm":
      return {
        title: "End-of-day sales pipeline",
        columns: ["Last update", "Opportunity", "Account", "Stage"],
        rows: demoDeals.filter((item) => item.date === date).map(
          ({ time, id, account, stage }) => [time, prefix + "-" + id, account, stage],
        ),
      };
    case "alarms":
      return {
        title: "End-of-day incident register",
        columns: ["Incident ID", "Incident", "Device", "Severity", "Status", "Raised at", "Last status change"],
        rows: getIncidentState(date).sort((a, b) => b.changedAt.localeCompare(a.changedAt)).map(({ id, name, device, severity, status, raisedAt, changedAt }) => [
          prefix + "-" + id,
          name,
          device === "entry" ? entry : device,
          severity,
          status,
          formatDemoDate(raisedAt.slice(0, 10)) + " " + raisedAt.slice(11),
          formatDemoDate(changedAt.slice(0, 10)) + " " + changedAt.slice(11),
        ]),
      };
    case "access":
      return {
        title: "Door access events",
        columns: ["Time", "Door", "Credential", "Result"],
        rows: demoAccessEvents.filter((item) => item.date === date).map(
          ({ time, door, credential, result }) => [
            time, door === "entry" ? entry : door, prefix + "-" + credential, result,
          ],
        ),
      };
    case "parking":
      return {
        title: "Daily parking occupancy",
        columns: ["Time", "Zone", "Peak occupied", "Spaces", "Available at peak", "Vehicle entries"],
        rows: [[
          "23:59", parking, values.peakOccupied, values.capacity,
          values.capacity - values.peakOccupied, values.vehicleEntries,
        ]],
      };
    case "projects":
      return {
        title: "Project milestones",
        columns: ["Time", "Project", "Item", "Value / status"],
        rows: [
          ["23:59", project, "Site survey", "Complete"],
          ["23:59", project, "Installation and inspection", values.progress + "% complete"],
          ["23:59", project, "Open tasks", values.openTasks],
          ["23:59", project, "Tasks completed on selected day", values.completedTasks],
          ["23:59", project, "Handover and acceptance", "Upcoming"],
        ],
      };
    case "energy":
      return {
        title: "Daily energy readings",
        columns: ["Time", "Meter", "Measurement", "Value (kWh)", "Status"],
        rows: [
          ["23:59", prefix + "-MAIN-METER", "Electricity used", values.usage, values.usage > values.budget ? "Above daily target" : "Within daily target"],
          ["23:59", prefix + "-SOLAR-METER", "Solar generation", values.solar, "Recorded"],
          ["23:59", prefix + "-MAIN-METER", "Daily energy target", values.budget, "Configured"],
          ["23:59", prefix + "-MAIN-METER", "Electricity used vs. target", values.usage - values.budget, values.usage > values.budget ? "Above daily target" : "Within daily target"],
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
