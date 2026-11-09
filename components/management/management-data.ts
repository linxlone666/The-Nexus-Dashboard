export const userMetrics = [
  ["Total Users", 124, "All registered users"],
  ["Active Users", 98, "Users with active access"],
  ["Inactive Users", 16, "Deactivated or suspended"],
  ["Pending Requests", 10, "Awaiting approval"],
] as const;

export const projects = [
  { key: "retail-analytics", name: "Retail Analytics", organization: "Nexus Headquarters", sites: 6, status: "Active", updated: "Today, 09:48" },
  { key: "customer-insights", name: "Customer Insights", organization: "North Campus", sites: 12, status: "Active", updated: "Today, 08:30" },
  { key: "sales-dashboard", name: "Sales Dashboard", organization: "Riverside Properties", sites: null, status: "Onboarding", updated: "Yesterday" },
] as const;

export const organizations = [...new Set(projects.map((project) => project.organization))];
export function getProjectMetrics(entries: readonly { organization: string; status: string }[]) {
  return [
    ["Total Projects", entries.length, "All sample projects"],
    ["Active Projects", entries.filter((project) => project.status === "Active").length, "Projects in operation"],
    ["Onboarding", entries.filter((project) => project.status === "Onboarding").length, "Projects being set up"],
    ["Organizations", new Set(entries.map((project) => project.organization)).size, "Organizations with projects"],
  ] as const;
}
