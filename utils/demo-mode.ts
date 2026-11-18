const configuredMode = process.env.NEXT_PUBLIC_NEXUS_DEMO;

export const demoEnabled =
  configuredMode === "true" ||
  (configuredMode !== "false" && process.env.NODE_ENV === "development");
