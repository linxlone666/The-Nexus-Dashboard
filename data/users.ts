// Starter records. Browser edits are applied separately in UserManagement.

export type User = {
  name: string;
  email: string;
  role: "User" | "Admin";
  projects: number;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
};

export const initialUsers: User[] = [
  {
    name: "Alex Turner",
    email: "alex@example.com",
    role: "User",
    projects: 3,
    status: "Active",
    lastActive: "Apr 24, 2026",
  },
  {
    name: "Maria Garcia",
    email: "maria@example.com",
    role: "User",
    projects: 5,
    status: "Active",
    lastActive: "Apr 24, 2026",
  },
  {
    name: "James Park",
    email: "james@example.com",
    role: "User",
    projects: 2,
    status: "Inactive",
    lastActive: "Apr 20, 2026",
  },
  {
    name: "Sophia Kim",
    email: "sophia@example.com",
    role: "User",
    projects: 4,
    status: "Active",
    lastActive: "Apr 24, 2026",
  },
  {
    name: "Daniel Brown",
    email: "daniel@example.com",
    role: "User",
    projects: 1,
    status: "Active",
    lastActive: "Apr 23, 2026",
  },
  {
    name: "Olivia Martinez",
    email: "olivia@example.com",
    role: "User",
    projects: 3,
    status: "Active",
    lastActive: "Apr 21, 2026",
  },
  {
    name: "Ethan Wilson",
    email: "ethan@example.com",
    role: "User",
    projects: 0,
    status: "Pending",
    lastActive: "Apr 18, 2026",
  },
  {
    name: "Sarah Lee",
    email: "sarah@example.com",
    role: "User",
    projects: 6,
    status: "Active",
    lastActive: "Apr 24, 2026",
  },
];

export const userMetrics = [
  ["Total Users", 124, "All registered users"],
  ["Active Users", 98, "Users with active access"],
  ["Inactive Users", 16, "Deactivated or suspended"],
  ["Pending Requests", 10, "Awaiting approval"],
] as const;
