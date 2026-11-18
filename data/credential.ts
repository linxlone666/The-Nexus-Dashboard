import { readManagement } from "@/utils/management-store";

export type Credential = { token: string; email: string };

export async function login(
  email: string,
  password: string,
): Promise<Credential> {
  const account = readManagement().accounts.find(
    (item) => item.email === email,
  );

  if (!account || !account.active || account.password !== password) {
    throw new Error(
      "Email or password is incorrect, or the account is inactive.",
    );
  }

  return { token: crypto.randomUUID(), email: account.email };
}

export function getDemoProfile(email: string) {
  const account = readManagement().accounts.find(
    (item) => item.email === email && item.active,
  );
  return (
    account && {
      email: account.email,
      name: account.name,
      role: account.role,
      siteIds: account.siteIds,
      systemsBySite: account.systemsBySite,
    }
  );
}
