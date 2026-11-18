export const demoCameras = [
  { number: "01", footage: { video: "/cctv/lobby.webm", poster: "/cctv/lobby.jpg" } },
  { number: "02", footage: { video: "/cctv/loading-dock.webm", poster: "/cctv/loading-dock.jpg" } },
  { number: "03", footage: { video: "/cctv/lobby.webm", poster: "/cctv/lobby.jpg" } },
] as const;

type CameraEvent = {
  date: string;
  time: string;
  camera: number;
  name: string;
  status: string;
  availability?: "Online" | "Offline";
};

export const demoCameraEvents: readonly CameraEvent[] = [
  { date: "2026-11-09", time: "10:31", camera: 2, name: "Camera disconnected", status: "Recorded", availability: "Offline" },
  { date: "2026-11-09", time: "14:12", camera: 2, name: "Camera connection restored", status: "Reviewed", availability: "Online" },
  { date: "2026-11-10", time: "10:31", camera: 2, name: "Camera disconnected", status: "Open", availability: "Offline" },
  { date: "2026-11-11", time: "08:05", camera: 2, name: "Camera connection restored", status: "Reviewed", availability: "Online" },
  { date: "2026-11-11", time: "10:31", camera: 1, name: "Camera disconnected", status: "Open", availability: "Offline" },
  { date: "2026-11-11", time: "10:46", camera: 0, name: "Motion detected", status: "Reviewed" },
];

export function getCameraState(date: string) {
  return demoCameras.map((camera, index) => {
    const lastChange = demoCameraEvents
      .filter((event) => event.camera === index && event.date <= date && event.availability)
      .at(-1);
    return {
      ...camera,
      status: lastChange?.availability ?? "Online",
      changedAt: lastChange ? lastChange.date + " " + lastChange.time : undefined,
    };
  });
}

type Incident = {
  id: string;
  name: string;
  device: string;
  severity: "Critical" | "Medium" | "Low";
  updates: readonly {
    date: string;
    time: string;
    status: "Open" | "Reviewed" | "Resolved";
  }[];
};

export const demoIncidents: readonly Incident[] = [
  {
    id: "ALM-01",
    name: "Service entrance connection lost",
    device: "Service entrance sensor",
    severity: "Critical",
    updates: [
      { date: "2026-11-09", time: "10:31", status: "Open" },
      { date: "2026-11-10", time: "09:15", status: "Reviewed" },
      { date: "2026-11-11", time: "08:05", status: "Resolved" },
    ],
  },
  {
    id: "ALM-02",
    name: "Door held open",
    device: "entry",
    severity: "Medium",
    updates: [
      { date: "2026-11-10", time: "10:06", status: "Open" },
      { date: "2026-11-11", time: "09:00", status: "Reviewed" },
    ],
  },
  {
    id: "ALM-03",
    name: "Parking camera disconnected",
    device: "Parking camera",
    severity: "Critical",
    updates: [{ date: "2026-11-11", time: "10:31", status: "Open" }],
  },
];

export function getIncidentState(date: string) {
  return demoIncidents.flatMap((incident) => {
    const latest = incident.updates.filter((update) => update.date <= date).at(-1);
    return latest ? [{
      id: incident.id,
      name: incident.name,
      device: incident.device,
      severity: incident.severity,
      status: latest.status,
      raisedAt: incident.updates[0].date + " " + incident.updates[0].time,
      changedAt: latest.date + " " + latest.time,
    }] : [];
  });
}

export function getSecurityCounts(date: string) {
  const cameras = getCameraState(date);
  const incidents = getIncidentState(date);
  return {
    cctv: [
      cameras.length,
      cameras.filter(({ status }) => status === "Online").length,
      demoCameraEvents.filter((event) => event.date === date).length,
    ],
    alarms: [
      incidents.length,
      incidents.filter(({ severity, status }) => severity === "Critical" && status !== "Resolved").length,
      incidents.filter(({ status }) => status === "Resolved").length,
    ],
  } satisfies Record<string, readonly [number, number, number]>;
}
