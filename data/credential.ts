import { loginManagement, readManagement } from "@/utils/management-store";

export type Credential = { token: string; email: string };

export async function login(
  email: string,
  password: string,
): Promise<Credential> {
  return loginManagement(email, password);
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
