import { getManagedSiteSystems } from "@/data/mock-system-data";
import {
  bootstrapEmail,
  roles,
  timeZones,
} from "@/data/management";
import type {
  AuditEvent,
  DemoAccount,
  ManagedSite,
  ManagementData,
  ManagementSettings,
} from "@/data/management";


export function createManagementActions(
  initial: ManagementData,
  actorEmail: string,
  projects: readonly { id: string }[],
) {
  let current = initial;
  const readManagement = () => current;
  const readDemoProjects = () => projects;
  const activeActor = () => current.accounts.find(account => account.active && account.email === actorEmail);
  function save(data: ManagementData, event: Omit<AuditEvent, "id" | "date">) {
    current = { ...data, audit: [{ ...event, actorEmail, id: crypto.randomUUID(), date: new Date().toISOString() }, ...data.audit].slice(0, 100) };
  }
function saveAccount(input: DemoAccount, existingEmail?: string) {
  const data = readManagement();
  if (activeActor()?.role !== "Superadmin")
    throw new Error("Only Superadmin can create or edit accounts.");
  writeAccount(data, input, existingEmail);
}

function writeAccount(
  data: ManagementData,
  input: DemoAccount,
  existingEmail?: string,
) {
  const account = {
    ...input,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
  };
  if (
    !account.name ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email) ||
    !roles.includes(account.role)
  ) {
    throw new Error("Enter a name, a valid email, and a role.");
  }
  if (
    data.accounts.some(
      (item) => item.email === account.email && item.email !== existingEmail,
    )
  ) {
    throw new Error("This email is already in use.");
  }
  const existing = data.accounts.find((item) => item.email === existingEmail);
  if (existingEmail && !existing)
    throw new Error("This account no longer exists.");
  if (
    existingEmail === bootstrapEmail &&
    (account.email !== bootstrapEmail ||
      !account.active ||
      account.role !== "Superadmin")
  ) {
    throw new Error("The built-in Superadmin must stay active.");
  }
  const password = account.password || existing?.password || "";
  if (password.length < 4)
    throw new Error("Use a demo password of at least four characters.");

  const saved = {
    ...existing,
    ...account,
    password,
    siteIds: account.siteIds.filter((id) =>
      data.sites.some((site) => site.id === id),
    ),
  };
  const actor = activeActor();
  const accounts = existing
    ? data.accounts.map((item) => (item.email === existingEmail ? saved : item))
    : [...data.accounts, saved];

  save(
    { ...data, accounts },
    {
      category: "Users",
      action: existing ? "Account updated" : "Account created",
      target: saved.email,
      userEmail: saved.role === "User" ? saved.email : undefined,
      siteIds: [...new Set([...(existing?.siteIds ?? []), ...saved.siteIds])].filter(
        (id) => actor?.role !== "Admin" || actor.siteIds.includes(id),
      ),
    },
  );
}

function saveSite(input: ManagedSite) {
  const data = readManagement();
  if (activeActor()?.role !== "Superadmin")
    throw new Error("Superadmin access required.");
  if (
    input.projectId &&
    !readDemoProjects().some((project) => project.id === input.projectId)
  )
    throw new Error("Choose a valid parent project.");
  return writeSite(data, input);
}

function writeSite(data: ManagementData, input: ManagedSite) {
  const site = {
    ...input,
    name: input.name.trim(),
    location: input.location.trim(),
  };
  if (!site.name || !site.location)
    throw new Error("Enter a site name and location.");
  if (
    data.sites.some(
      (item) =>
        item.id !== site.id &&
        item.name.toLowerCase() === site.name.toLowerCase(),
    )
  ) {
    throw new Error("A site with this name already exists.");
  }
  const existing = data.sites.some(({ id }) => id === site.id);
  const sites = existing
    ? data.sites.map((item) => (item.id === site.id ? site : item))
    : [...data.sites, site];
  save(
    { ...data, sites },
    {
      category: "Sites",
      action: existing ? "Site updated" : "Site created",
      target: site.name,
      siteIds: [site.id],
    },
  );
}

function saveSettings(settings: ManagementSettings) {
  if (activeActor()?.role !== "Superadmin") throw new Error("Superadmin access required.");
  if (
    !timeZones.includes(settings.timeZone) ||
    !["standard", "compact"].includes(settings.density)
  ) {
    throw new Error("Choose valid display settings.");
  }
  const data = readManagement();
  save(
    { ...data, settings },
    {
      category: "Settings",
      action: "Display preferences updated",
      target: settings.density + " · " + settings.timeZone,
    },
  );
}

function removeSite(siteId: string, confirmation: string) {
  const data = readManagement();
  if (activeActor()?.role !== "Superadmin")
    throw new Error("Superadmin access required.");
  const site = data.sites.find((item) => item.id === siteId);
  if (!site || site.name !== confirmation)
    throw new Error("Type the current site name to confirm.");
  const sites = data.sites.filter((item) => item.id !== siteId);
  const accounts = data.accounts.map((account) => ({
    ...account,
    siteIds: account.siteIds.filter((id) => id !== siteId),
    systemsBySite:
      account.systemsBySite &&
      Object.fromEntries(
        Object.entries(account.systemsBySite).filter(([id]) => id !== siteId),
      ),
  }));
  save(
    { ...data, sites, accounts },
    { category: "Sites", action: "Site removed", target: site.name, siteIds: [site.id] },
  );
}

function saveSitePreferences(
  siteId: string,
  name: string,
  timeZone: string,
) {
  const data = readManagement();
  const actor = activeActor();
  const site = data.sites.find((item) => item.id === siteId);
  if (!site || actor?.role !== "Admin" || !actor.siteIds.includes(siteId))
    throw new Error("This site is outside your access.");
  const zone = timeZones.find((item) => item === timeZone);
  if (!zone) throw new Error("Choose a valid time zone.");
  writeSite(data, { ...site, name, timeZone: zone });
}

function saveStandardUserAccess(
  email: string,
  assignedIds: string[],
  requestedSystems: NonNullable<DemoAccount["systemsBySite"]>,
) {
  const data = readManagement();
  const actor = activeActor();
  const account = data.accounts.find((item) => item.email === email);
  if (actor?.role !== "Admin" || account?.role !== "User") {
    throw new Error("Only Admin can update access for standard users.");
  }
  const managedSites = data.sites.filter((site) =>
    actor.siteIds.includes(site.id),
  );
  const managedIds = new Set(managedSites.map((site) => site.id));
  const assigned = new Set(assignedIds);
  if (
    assignedIds.some((id) => !managedIds.has(id)) ||
    Object.keys(requestedSystems).some((id) => !assigned.has(id))
  ) {
    throw new Error("This site is outside your access selection.");
  }
  const systemsBySite = Object.fromEntries(
    Object.entries(account.systemsBySite ?? {}).filter(
      ([id]) => !managedIds.has(id),
    ),
  );
  for (const site of managedSites) {
    if (!assigned.has(site.id) || !Object.hasOwn(requestedSystems, site.id))
      continue;
    const requested = requestedSystems[site.id];
    const configured = getManagedSiteSystems(site);
    if (
      requested.some((id) => !configured.some((system) => system.id === id))
    ) {
      throw new Error("A selected system is not configured for this site.");
    }
    systemsBySite[site.id] = [...new Set(requested)];
  }
  const siteIds = [
    ...account.siteIds.filter((id) => !managedIds.has(id)),
    ...assigned,
  ];
  writeAccount(data, { ...account, siteIds, systemsBySite }, email);
}

  return { saveAccount, saveSite, saveSettings, removeSite, saveSitePreferences, saveStandardUserAccess, snapshot: () => current };
}
