import type { AuditEvent, DemoAccount } from "@/data/management";

export function scopedAudit(
  audit: AuditEvent[],
  profile?: Pick<DemoAccount, "role" | "siteIds"> | null,
) {
  return audit.filter((event) =>
    profile?.role === "Superadmin" ||
    (profile?.role === "Admin" &&
      (event.category === "Sites" || (event.category === "Users" && !!event.userEmail)) &&
      event.siteIds?.some((id) => profile.siteIds.includes(id))),
  ).sort((a, b) => b.date.localeCompare(a.date));
}
