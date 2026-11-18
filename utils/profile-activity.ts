import type { AuditEvent, DemoAccount, ManagedSite } from "@/data/management";
import { canAccessSite } from "@/data/management";

export function profileActivity(
  audit: AuditEvent[],
  profile: Pick<DemoAccount, "email" | "role" | "siteIds">,
  sites: ManagedSite[],
) {
  const allowedSites = new Set(
    sites.filter((site) => canAccessSite(site, profile)).map((site) => site.id),
  );

  return audit
    .filter((event) => {
      const ownAccountEvent =
        event.category === "Users" &&
        (event.userEmail === profile.email || event.target === profile.email);
      if (event.actorEmail !== profile.email && !ownAccountEvent) return false;
      if (profile.role === "Superadmin") return true;
      if (event.siteIds?.length) {
        return event.siteIds.every((id) => allowedSites.has(id));
      }
      return ownAccountEvent;
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}
