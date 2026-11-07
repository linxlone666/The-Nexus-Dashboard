export const userMetrics = [
  ["Total Users", 124, "All registered users"],
  ["Active Users", 98, "Users with active access"],
  ["Inactive Users", 16, "Deactivated or suspended"],
  ["Pending Requests", 10, "Awaiting approval"],
] as const;

export const projects = [
  { name: "Retail Analytics", organization: "Nexus Headquarters", sites: 6, status: "Active", updated: "Today, 09:48" },
  { name: "Customer Insights", organization: "North Campus", sites: 12, status: "Active", updated: "Today, 08:30" },
  { name: "Sales Dashboard", organization: "Riverside Properties", sites: null, status: "Onboarding", updated: "Yesterday" },
] as const;

export const organizations = [...new Set(projects.map((project) => project.organization))];
export const projectMetrics = [
  ["Total Projects", projects.length, "All sample projects"],
  ["Active Projects", projects.filter((project) => project.status === "Active").length, "Projects in operation"],
  ["Onboarding", projects.filter((project) => project.status === "Onboarding").length, "Projects being set up"],
  ["Organizations", organizations.length, "Organizations with projects"],
] as const;
