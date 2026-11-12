export type DemoRole = "User" | "Admin" | "Superadmin";

// These are public demo credentials for the frontend prototype.
export const mockAccounts: {
  name: string;
  email: string;
  password: string;
  role: DemoRole;
}[] = [
  {
    name: "Alex Turner",
    email: "user@company.com",
    password: "pass",
    role: "User",
  },
  {
    name: "John Doe",
    email: "admin@company.com",
    password: "pass",
    role: "Admin",
  },
  {
    name: "Alex Lim",
    email: "superadmin@company.com",
    password: "pass",
    role: "Superadmin",
  },
  // Keep the older login branch's manager account working too.
  {
    name: "Demo Manager",
    email: "manager@company.com",
    password: "pass",
    role: "Admin",
  },
];
