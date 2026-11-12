import { initialUsers } from "./users";

export const permissions = [
  ["View Dashboard", "Main dashboard"],
  ["Access Projects", "Assigned projects"],
  ["Manage Vendors", "Vendor information", true],
  ["Manage Integrations", "Data integrations", true],
  ["View Audit Logs", "System logs", true],
  ["Manage Users", "User accounts", true],
  ["Manage Settings", "Platform settings", true],
] as const;

export const permissionProjects = [
  "Retail Analytics",
  "Customer Insights",
  "Sales Dashboard",
  "Marketing Data",
];
export type Access = {
  permissions: string[];
  projects: Record<string, string>;
};
export const emptyAccess: Access = { permissions: [], projects: {} };
export const initialAccess: Record<string, Access> = {
  [initialUsers[0].email]: {
    permissions: ["View Dashboard", "Access Projects", "Manage Integrations"],
    projects: { "Retail Analytics": "Editor", "Customer Insights": "Viewer" },
  },
};
