import type { DemoRole } from "@/data/mock-accounts";
import type { Access, PermissionName } from "@/data/permissions";

export type ProjectReference = { key: string; name: string };
export type ProjectLevel = "" | "Viewer" | "Editor";

// A role sets the upper limit. Saved checkboxes choose access within that limit.
export function roleSupportsPermission(role: DemoRole, permission: string) {
  if (role === "Superadmin") return true;
  if (permission === "Manage Vendors") return false;
  if (role === "User")
    return permission === "View Dashboard" || permission === "Access Projects";
  return true;
}

export function hasPermission(
  role: DemoRole | undefined,
  access: Access,
  permission: PermissionName,
) {
  if (!role || !roleSupportsPermission(role, permission)) return false;
  return role === "Superadmin" || access.permissions.includes(permission);
}

export function getProjectLevel(
  role: DemoRole | undefined,
  access: Access,
  project: ProjectReference,
): ProjectLevel {
  if (!hasPermission(role, access, "Access Projects")) return "";
  if (role === "Superadmin") return "Editor";
  // Older saved assignments used project names; new assignments use stable keys.
  const level = access.projects[project.key] ?? access.projects[project.name];
  return level === "Viewer" || level === "Editor" ? level : "";
}

export const sectionPermissions = {
  Overview: "View Dashboard",
  Users: "Manage Users",
  Projects: "Access Projects",
  Vendors: "Manage Vendors",
  Integrations: "Manage Integrations",
  "Audit Logs": "View Audit Logs",
  Settings: "Manage Settings",
} as const;

export function getDashboardPath(role: DemoRole, access: Access) {
  if (role === "Superadmin") return "/superadmin/overview";
  if (hasPermission(role, access, "View Dashboard"))
    return role === "User" ? "/dashboard" : "/admin/overview";
  if (role === "User")
    return hasPermission(role, access, "Access Projects")
      ? "/dashboard/projects"
      : "/no-access";
  const destinations: [PermissionName, string][] = [
    ["Manage Users", "/admin"],
    ["Access Projects", "/admin/projects"],
    ["Manage Integrations", "/admin/integrations"],
    ["View Audit Logs", "/admin/audit-logs"],
    ["Manage Settings", "/admin/settings"],
  ];
  return (
    destinations.find(([permission]) =>
      hasPermission(role, access, permission),
    )?.[1] ?? "/no-access"
  );
}

export function canAccessDashboardPath(
  role: DemoRole,
  access: Access,
  path: string,
) {
  const pathname = path.split(/[?#]/)[0];
  const prefix = {
    User: "/dashboard",
    Admin: "/admin",
    Superadmin: "/superadmin",
  }[role];
  if (pathname !== prefix && !pathname.startsWith(prefix + "/")) return false;
  if (role === "Superadmin") return true;
  if (role === "User") {
    if (pathname === "/dashboard" || pathname === "/dashboard/overview")
      return hasPermission(role, access, "View Dashboard");
    return (
      pathname === "/dashboard/projects" &&
      hasPermission(role, access, "Access Projects")
    );
  }
  const pages: Record<string, PermissionName> = {
    "/admin": "Manage Users",
    "/admin/overview": "View Dashboard",
    "/admin/projects": "Access Projects",
    "/admin/integrations": "Manage Integrations",
    "/admin/audit-logs": "View Audit Logs",
    "/admin/settings": "Manage Settings",
  };
  const permission = pages[pathname];
  return Boolean(permission && hasPermission(role, access, permission));
}
