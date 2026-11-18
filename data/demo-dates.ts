export const demoDates = ["2026-11-09", "2026-11-10", "2026-11-11"] as const;
export const latestDemoDate = demoDates[demoDates.length - 1];

const fullDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDemoDate(date: string) {
  return fullDate.format(new Date(date));
}

export function formatDemoPeriod() {
  return "9–11 November 2026";
}
