export const permissions = [
  ["View Dashboard", "Open the dashboard overview"],
  ["Access Projects", "Open assigned projects"],
  ["Manage Vendors", "Superadmin accounts only", true],
  ["Manage Integrations", "Review integrations for assigned projects", true],
  ["View Audit Logs", "Review recorded management activity", true],
  ["Manage Users", "Create users and edit their access", true],
  ["Manage Settings", "Change management display preferences", true],
] as const;

export type PermissionName = (typeof permissions)[number][0];
export type Access = {
  permissions: string[];
  projects: Record<string, string>;
};
export const emptyAccess: Access = { permissions: [], projects: {} };
export const initialAccess: Record<string, Access> = {};
