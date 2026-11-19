import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { demoProjects, initialManagementData, type ManagementData } from "@/data/management";
import { createManagementActions } from "./management-actions";
import { demoEnabled } from "./demo-mode";

type Session = { email: string; expires: number };
type State = { revision: number; data: ManagementData; sessions: Record<string, Session> };
const location = process.env.NEXUS_DEMO_DATA_FILE ?? path.join(process.cwd(), ".nexus-demo", "management.json");
// Serialise the whole read/modify/write transaction, including through dev reloads.
const shared = globalThis as typeof globalThis & { nexusDemoQueue?: Promise<unknown> };
export class DemoError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
async function readState(): Promise<State> {
  try { return JSON.parse(await readFile(/* turbopackIgnore: true */ location, "utf8")); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { revision: 0, data: structuredClone(initialManagementData), sessions: {} };
  }
}
export function transaction<T>(operation: (state: State) => T | Promise<T>, persist = false): Promise<T> {
  const task = (shared.nexusDemoQueue ?? Promise.resolve()).then(async () => {
    if (!demoEnabled) throw new DemoError("Demo sign-in is disabled.", 404);
    const state = await readState();
    const result = await operation(state);
    if (persist) {
      await mkdir(path.dirname(location), { recursive: true });
      const temporary = location + ".tmp";
      await writeFile(temporary, JSON.stringify(state), { mode: 0o600 });
      await rename(temporary, location);
    }
    return result;
  });
  shared.nexusDemoQueue = task.catch(() => {});
  return task;
}
export function requireSession(state: State, token: string) {
  const session = state.sessions[token];
  if (!session || session.expires < Date.now() || !state.data.accounts.some(account => account.email === session.email && account.active)) {
    throw new DemoError("Your demo session has ended. Please sign in again.", 401);
  }
  return session;
}
export function snapshot(state: State) {
  return { revision: state.revision, data: { ...state.data, accounts: state.data.accounts.map(account => ({ ...account, password: "" })) } };
}
export function loginShared(state: State, email: string, password: string) {
  const account = state.data.accounts.find(account => account.email === email.trim().toLowerCase() && account.active && account.password === password);
  if (!account) throw new DemoError("Email or password is incorrect, or the account is inactive.", 401);
  account.lastSignIn = new Date().toISOString();
  const token = crypto.randomUUID();
  state.sessions = Object.fromEntries(Object.entries(state.sessions).filter(([, session]) => session.expires > Date.now()));
  state.sessions[token] = { email: account.email, expires: Date.now() + 24 * 60 * 60 * 1000 };
  state.revision++;
  return { credential: { email: account.email, token }, ...snapshot(state) };
}
export type ManagementAction =
  | { action: "saveAccount"; args: Parameters<ReturnType<typeof createManagementActions>["saveAccount"]> }
  | { action: "saveSite"; args: Parameters<ReturnType<typeof createManagementActions>["saveSite"]> }
  | { action: "saveSettings"; args: Parameters<ReturnType<typeof createManagementActions>["saveSettings"]> }
  | { action: "removeSite"; args: Parameters<ReturnType<typeof createManagementActions>["removeSite"]> }
  | { action: "saveSitePreferences"; args: Parameters<ReturnType<typeof createManagementActions>["saveSitePreferences"]> }
  | { action: "saveStandardUserAccess"; args: Parameters<ReturnType<typeof createManagementActions>["saveStandardUserAccess"]> };
export function applyAction(state: State, token: string, input: ManagementAction) {
  const session = requireSession(state, token);
  const actions = createManagementActions(state.data, session.email, demoProjects);
  switch (input.action) {
    case "saveAccount": actions.saveAccount(...input.args); break;
    case "saveSite": actions.saveSite(...input.args); break;
    case "saveSettings": actions.saveSettings(...input.args); break;
    case "removeSite": actions.removeSite(...input.args); break;
    case "saveSitePreferences": actions.saveSitePreferences(...input.args); break;
    case "saveStandardUserAccess": actions.saveStandardUserAccess(...input.args); break;
    default: throw new DemoError("Unknown management action.");
  }
  state.data = actions.snapshot();
  state.revision++;
  return snapshot(state);
}
