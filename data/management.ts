import type { SystemId, WorkSiteId } from "./mock-system-data";
import { workSites } from "./work-sites";

export const roles = ["User", "Admin", "Superadmin"] as const;
export type ManagementRole = (typeof roles)[number];

export type DemoAccount = {
  name: string;
  email: string;
  password: string;
  role: ManagementRole;
  active: boolean;
  siteIds: string[];
  systemsBySite?: Record<string, SystemId[]>;
  lastSignIn?: string;
};

export type SiteDataSource =
  | { kind: "sample"; sampleSiteId: WorkSiteId; systemIds: SystemId[] }
  | { kind: "rest"; endpoint: string; systemIds: SystemId[]; vendor?: string };

export const demoProjects = [
  { id: "nexus-operations", name: "Nexus Operations", legacySiteCount: 0 },
  { id: "retail-analytics", name: "Retail Analytics", legacySiteCount: 6 },
  { id: "customer-insights", name: "Customer Insights", legacySiteCount: 12 },
  { id: "sales-dashboard", name: "Sales Dashboard", legacySiteCount: 0 },
] as const;

export function siteProjectId(site: ManagedSite) {
  return site.projectId ?? demoProjects[0].id;
}

export type ManagedSite = {
  id: string;
  name: string;
  location: string;
  active: boolean;
  source?: SiteDataSource;
  projectId?: string;
  setupStatus?: "ready" | "onboarding";
  timeZone?: ManagementSettings["timeZone"];
};

export const timeZones = ["Asia/Bangkok", "UTC", "Asia/Singapore"] as const;

export type ManagementSettings = {
  density: "standard" | "compact";
  timeZone: (typeof timeZones)[number];
};

export type AuditEvent = {
  id: string;
  date: string;
  category: "Users" | "Sites" | "Settings";
  action: string;
  target: string;
};

export type ManagementData = {
  accounts: DemoAccount[];
  sites: ManagedSite[];
  settings: ManagementSettings;
  audit: AuditEvent[];
};

export const bootstrapEmail = "superadmin@company.com";
const siteIds = workSites.map(({ id }) => id);
const demoAccounts = [
  { name: "Nexus Superadmin", email: bootstrapEmail, role: "Superadmin" },
  { name: "Nexus Admin", email: "admin@company.com", role: "Admin" },
  { name: "Alex Turner", email: "user@company.com", role: "User" },
  { name: "Nexus Manager", email: "manager@company.com", role: "User" },
] as const;

export const initialManagementData: ManagementData = {
  accounts: demoAccounts.map((account) => ({
    ...account,
    active: true,
    password: "pass",
    siteIds,
  })),
  sites: workSites.map((site) => ({ ...site, active: true })),
  settings: { density: "standard", timeZone: "Asia/Bangkok" },
  audit: [],
};

export function availableSites(
  data: ManagementData,
  account: Pick<DemoAccount, "role" | "siteIds">,
) {
  return data.sites.filter(
    (site) =>
      site.active &&
      (account.role === "Superadmin" || account.siteIds.includes(site.id)),
  );
}
