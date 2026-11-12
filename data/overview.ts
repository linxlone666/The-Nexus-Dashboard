export const overview = {
  Admin: {
    description:
      "Manage standard users and review existing projects in your workspace.",
    links: [
      [
        "Users",
        "User Management",
        "Manage standard users and their project access.",
      ],
      [
        "Projects",
        "Project Management",
        "Browse existing projects, organizations, and onboarding status.",
      ],
    ],
    attention: "Access requests awaiting review",
    detail: "10 requests are pending in the sample workspace.",
    destination: "Users",
  },
  Superadmin: {
    description:
      "Monitor organizations, project onboarding, and administration across the platform.",
    links: [
      [
        "Projects",
        "Project Management",
        "Review organizations and project onboarding.",
      ],
      ["Users", "User Management", "Review user access across organizations."],
    ],
    attention: "Project onboarding awaiting an administrator",
    detail: "Riverside Properties has one project in onboarding.",
    destination: "Projects",
  },
} as const;
