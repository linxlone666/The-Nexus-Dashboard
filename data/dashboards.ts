export const dashboards = [
  {
    name: "User",
    href: "/dashboard",
    description: "View site activity, alarms, access, and parking.",
  },
  {
    name: "Admin",
    href: "/admin/overview",
    description: "Manage users and review existing projects.",
  },
  {
    name: "Superadmin",
    href: "/superadmin/overview",
    description: "Set up projects and manage vendors and integrations.",
  },
] as const;
