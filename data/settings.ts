export const auditTimeZones = {
  local: "Browser time zone",
  UTC: "UTC",
  "Asia/Bangkok": "Bangkok (UTC+7)",
} as const;

export type Preferences = {
  density: "standard" | "compact";
  timeZone: keyof typeof auditTimeZones;
};

export const defaultPreferences: Preferences = {
  density: "standard",
  timeZone: "local",
};
