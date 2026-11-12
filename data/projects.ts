// Starter projects. Browser-created projects are added by project-storage.ts.

export const projects = [
  {
    key: "retail-analytics",
    name: "Retail Analytics",
    organization: "Nexus Headquarters",
    sites: 6,
    status: "Active",
    updated: "Today, 09:48",
  },
  {
    key: "customer-insights",
    name: "Customer Insights",
    organization: "North Campus",
    sites: 12,
    status: "Active",
    updated: "Today, 08:30",
  },
  {
    key: "sales-dashboard",
    name: "Sales Dashboard",
    organization: "Riverside Properties",
    sites: null,
    status: "Onboarding",
    updated: "Yesterday",
  },
] as const;

export const organizations = [
  ...new Set(projects.map((project) => project.organization)),
];
