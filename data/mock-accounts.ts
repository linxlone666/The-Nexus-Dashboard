export type DemoRole = "User" | "Admin" | "Superadmin";

// Keep one starter account so you can create your own users in the UI.
export const mockAccounts = [
  {
    name: "Superadmin",
    email: "superadmin@company.com",
    password: "pass",
    role: "Superadmin" as DemoRole,
  },
];
