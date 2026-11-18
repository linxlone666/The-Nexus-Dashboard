import type { ManagementRole } from "@/data/management";

const navigation = [
  {
    label: "Overview",
    icon: "management-home",
    Admin: "/admin",
    Superadmin: "/superadmin",
  },
  {
    label: "Users",
    icon: "management-users",
    Admin: "/admin/users",
    Superadmin: "/superadmin/users",
  },
  {
    label: "Sites",
    icon: "management-projects",
    Admin: "/admin/projects",
    Superadmin: "/superadmin/sites",
  },
  {
    label: "Audit Logs",
    icon: "management-audit",
    Admin: "/admin/audit-logs",
    Superadmin: "/superadmin/audit-logs",
  },
  {
    label: "Settings",
    icon: "management-settings",
    Admin: null,
    Superadmin: "/superadmin/settings",
  },
];

export function managementLinks(role?: ManagementRole) {
  if (role !== "Admin" && role !== "Superadmin") return [];
  return navigation.flatMap(({ label, icon, ...routes }) => {
    const href = routes[role];
    return href ? [{ label, icon, href }] : [];
  });
}
