export const statuse = [
  {
    Email: "pom@Nexus.com",
    role: "Admin",
    statuse: 120,
    log_work: "january",
    action: "Edit",
  },
  {
    Email: "mon@Nexus.com",
    role: "SuperAdmin",
    statuse: 47,
    log_work: "february",
    action: "View",
  },
  {
    Email: "Bean@Nexus.com",
    role: "User",
    statuse: 7,
    log_work: "september",
    action: "View",
  },
  {
    Email: "JOHN@Nexus.com",
    role: "User",
    statuse: 0,
    log_work: "march",
    action: "Edit",
  },
];

export type StatusType = (typeof statuse)[number];
