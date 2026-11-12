import { mockAccounts } from "./mock-accounts";
import type { DemoRole } from "./mock-accounts";

export type Credential = {
  token: string;
  email: string;
  name: string;
  role: DemoRole;
};

export async function login(
  email: string,
  password: string,
): Promise<Credential> {
  const account = mockAccounts.find(
    (account) => account.email === email.trim().toLowerCase(),
  );
  if (!account) throw new Error("User not found");
  if (account.password !== password) throw new Error("Invalid password");

  // Passwords stay in the mock data; only this demo session is saved in the browser.
  return {
    token: crypto.randomUUID(),
    email: account.email,
    name: account.name,
    role: account.role,
  };
}
