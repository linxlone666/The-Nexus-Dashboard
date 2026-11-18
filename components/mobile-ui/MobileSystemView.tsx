"use client";

import Link from "next/link";
import { MonitoringView } from "@/app/home/MonitoringView";
import { SystemTile } from "@/app/home/SystemTile";
import { canAccessSite } from "@/data/management";
import { getManagedSiteSystems, type SystemId } from "@/data/mock-system-data";
import { useDemoProfile } from "@/utils/demo-session";
import { useSelectedWorkSite } from "@/utils/selected-work-site";
import "@/app/home/overview.css";

export function MobileSystemView({ systemId }: { systemId?: SystemId }) {
  const profile = useDemoProfile();
  const site = useSelectedWorkSite();
  if (!profile || !site || !canAccessSite(site, profile)) {
    return <p>Choose an assigned site to view system data.</p>;
  }

  const permitted = profile.role === "Superadmin" ? undefined : profile.systemsBySite?.[site.id];
  const systems = getManagedSiteSystems(site).filter(
    ({ id }) => permitted === undefined || permitted.includes(id),
  );
  if (systemId) {
    const system = systems.find(({ id }) => id === systemId);
    return (
      <>
        <Link href="/home">Back to Dashboard</Link>
        {system ? <MonitoringView site={site} system={system} /> : <p>This system is unavailable for the selected site.</p>}
      </>
    );
  }

  return (
    <>
      <section className="overview-intro">
        <h1>Operations overview</h1>
        <p>{site.name}</p>
      </section>
      <section className="mobile-system-summaries" aria-label="Operations summary">
        {systems.map(({ id, name }) => (
          <div className="metric-card" key={id}>
            <SystemTile title={name} site={site} systemId={id} display="summary" dataKey="summary" />
            <Link className="text-link" href={"/home#system=" + id}>View system details</Link>
          </div>
        ))}
        {!systems.length && <p>No systems are available for this site.</p>}
      </section>
    </>
  );
}
