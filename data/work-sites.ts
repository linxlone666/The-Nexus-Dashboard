export const workSites = [
  { id: "headquarters", name: "Nexus Headquarters", location: "Bangkok" },
  { id: "north-campus", name: "North Campus", location: "Bangkok" },
  { id: "muang-thong", name: "Muang Thong", location: "Nonthaburi" },
] as const;

export function getWorkSite(id: string | null) {
  return workSites.find((site) => site.id === id);
}
