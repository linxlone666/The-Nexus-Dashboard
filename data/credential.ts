import type { DemoRole } from "./mock-accounts";
import {
  getUserSnapshot,
  readUserChanges,
  getUsers,
  getUserPassword,
  saveUserChanges,
} from "@/utils/user-store";

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
  const changes = readUserChanges(getUserSnapshot());
  const account = getUsers(changes).find(
    (user) => user.email === email.trim().toLowerCase(),
  );
  if (!account) throw new Error("User not found");
  const savedPassword = getUserPassword(account.email, changes);
  if (!savedPassword)
    throw new Error(
      "Ask your administrator to set a demo password in Users → General.",
    );
  if (savedPassword !== password) throw new Error("Invalid password");
  if (account.status !== "Active")
    throw new Error(
      "This account is " +
        account.status.toLowerCase() +
        ". Ask your administrator to activate it.",
    );
  const lastActive = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (
    !saveUserChanges({
      ...changes,
      lastActiveByEmail: {
        ...changes.lastActiveByEmail,
        [account.email]: lastActive,
      },
    })
  )
    throw new Error("This browser could not save your login.");
  return {
    token: crypto.randomUUID(),
    email: account.email,
    name: account.name,
    role: account.role,
  };
}
