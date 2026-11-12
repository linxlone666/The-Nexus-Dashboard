export function getProjectMetrics(
  entries: readonly { organization: string; status: string }[],
) {
  return [
    ["Total Projects", entries.length, "All sample projects"],
    [
      "Active Projects",
      entries.filter((project) => project.status === "Active").length,
      "Projects in operation",
    ],
    [
      "Onboarding",
      entries.filter((project) => project.status === "Onboarding").length,
      "Projects being set up",
    ],
    [
      "Organizations",
      new Set(entries.map((project) => project.organization)).size,
      "Organizations with projects",
    ],
  ] as const;
}
