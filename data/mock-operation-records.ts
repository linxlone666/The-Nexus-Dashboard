export const demoExpectedStaff = 4;

export const demoCheckIns = [
  { date: "2026-11-09", employee: "EMP-014", time: "08:03", checkpoint: "entry", status: "On time" },
  { date: "2026-11-09", employee: "EMP-027", time: "08:22", checkpoint: "Staff entrance", status: "On time" },
  { date: "2026-11-10", employee: "EMP-014", time: "08:05", checkpoint: "entry", status: "On time" },
  { date: "2026-11-10", employee: "EMP-027", time: "08:21", checkpoint: "Staff entrance", status: "On time" },
  { date: "2026-11-10", employee: "EMP-038", time: "08:29", checkpoint: "Staff entrance", status: "On time" },
  { date: "2026-11-11", employee: "EMP-014", time: "08:03", checkpoint: "entry", status: "On time" },
  { date: "2026-11-11", employee: "EMP-027", time: "08:29", checkpoint: "Staff entrance", status: "On time" },
  { date: "2026-11-11", employee: "EMP-038", time: "08:47", checkpoint: "Staff entrance", status: "Late" },
] as const;

export const demoVisits = [
  { date: "2026-11-09", pass: "V001", time: "09:10", purpose: "Maintenance visit", status: "Checked out" },
  { date: "2026-11-10", pass: "V002", time: "09:15", purpose: "Site inspection", status: "Checked out" },
  { date: "2026-11-10", pass: "V003", time: "10:20", purpose: "Equipment delivery", status: "On site" },
  { date: "2026-11-11", pass: "V014", time: "10:32", purpose: "Site inspection", status: "On site" },
  { date: "2026-11-11", pass: "V013", time: "10:14", purpose: "Equipment delivery", status: "Denied" },
  { date: "2026-11-11", pass: "V009", time: "09:05", purpose: "Maintenance visit", status: "Checked out" },
] as const;

export const demoDeals = [
  { date: "2026-11-09", time: "09:00", id: "DEAL-024", account: "Demo Services Co.", stage: "New lead" },
  { date: "2026-11-09", time: "14:00", id: "DEAL-023", account: "Demo Retail Group", stage: "Proposal sent" },
  { date: "2026-11-10", time: "10:00", id: "DEAL-024", account: "Demo Services Co.", stage: "New lead" },
  { date: "2026-11-10", time: "14:30", id: "DEAL-023", account: "Demo Retail Group", stage: "Negotiation" },
  { date: "2026-11-10", time: "16:00", id: "DEAL-011", account: "Demo Facilities Ltd.", stage: "Won today" },
  { date: "2026-11-11", time: "09:00", id: "DEAL-024", account: "Demo Services Co.", stage: "New lead" },
  { date: "2026-11-11", time: "11:00", id: "DEAL-023", account: "Demo Retail Group", stage: "Proposal sent" },
  { date: "2026-11-11", time: "14:00", id: "DEAL-017", account: "Demo Logistics Co.", stage: "Negotiation" },
  { date: "2026-11-11", time: "16:00", id: "DEAL-011", account: "Demo Facilities Ltd.", stage: "Won today" },
] as const;

export const demoAccessEvents = [
  { date: "2026-11-09", time: "10:42", door: "entry", credential: "B034", result: "Granted" },
  { date: "2026-11-09", time: "11:20", door: "Staff entrance", credential: "B053", result: "Granted" },
  { date: "2026-11-10", time: "10:12", door: "Service entrance", credential: "B108", result: "Denied" },
  { date: "2026-11-11", time: "10:42", door: "entry", credential: "B034", result: "Granted" },
  { date: "2026-11-11", time: "10:26", door: "Service entrance", credential: "B108", result: "Denied" },
  { date: "2026-11-11", time: "10:09", door: "Staff entrance", credential: "B053", result: "Granted" },
] as const;

export function getOperationCounts(date: string) {
  const checkIns = demoCheckIns.filter((item) => item.date === date);
  const visits = demoVisits.filter((item) => item.date === date);
  const deals = demoDeals.filter((item) => item.date === date);
  const access = demoAccessEvents.filter((item) => item.date === date);
  return {
    attendance: [
      demoExpectedStaff,
      checkIns.length,
      checkIns.filter(({ status }) => status === "On time").length,
    ],
    visitors: [
      visits.filter(({ status }) => status !== "Denied").length,
      visits.filter(({ status }) => status === "Checked out").length,
      visits.filter(({ status }) => status === "Denied").length,
    ],
    crm: [
      deals.filter(({ stage }) => stage === "New lead").length,
      deals.filter(({ stage }) => stage === "Proposal sent" || stage === "Negotiation").length,
      deals.filter(({ stage }) => stage === "Won today").length,
    ],
    access: [
      access.filter(({ result }) => result === "Granted").length,
      access.filter(({ result }) => result === "Denied").length,
      new Set(access.map(({ door }) => door)).size,
    ],
  } satisfies Record<string, readonly [number, number, number]>;
}
