import { mockAccounts } from "./mock-accounts";
import type { DemoRole } from "./mock-accounts";

export type User = {
  name: string;
  email: string;
  role: DemoRole;
  projects: number;
  status: "Active" | "Inactive" | "Pending";
  lastActive: string;
};

// Passwords are not included in table records or CSV exports.
export const initialUsers: User[] = mockAccounts.map(
  ({ name, email, role }) => ({
    name,
    email,
    role,
    projects: 0,
    status: "Active",
    lastActive: "Never",
  }),
);
