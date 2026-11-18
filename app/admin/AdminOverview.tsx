"use client";

import Link from "next/link";
import { useDemoProfile } from "@/utils/demo-session";
import { useManagement } from "@/utils/management-store";
import { scopedAudit } from "@/utils/scoped-audit";

export function AdminOverview() {
  const profile = useDemoProfile();
  const { accounts, sites, audit } = useManagement();
  const managed = sites.filter((site) => profile?.siteIds.includes(site.id));
  const users = accounts.filter((account) => account.role === "User" && managed.some((site) => account.siteIds.includes(site.id)));
  const events = scopedAudit(audit, profile);
  const onboarding = managed.filter((site) => site.setupStatus === "onboarding" || (!site.setupStatus && site.source?.kind === "rest"));
  return (
    <main>
      <h1>Admin Overview</h1>
      <div className="superadmin-metrics">
        <Link className="superadmin-card" href="/admin/users"><span>Assigned users</span><strong>{users.length}</strong></Link>
        <Link className="superadmin-card" href="/admin/projects"><span>Active sites</span><strong>{managed.filter((site) => site.active).length}</strong></Link>
        <a className="superadmin-card" href="#site-setup"><span>Sites awaiting setup</span><strong>{onboarding.length}</strong></a>
      </div>
      <section id="site-setup" className="superadmin-card">
        <h2>Sites awaiting setup</h2>
        {onboarding.length ? <ul className="superadmin-event-list">{onboarding.map((site) => <li key={site.id}>{site.name}</li>)}</ul> : <p>No assigned sites are awaiting setup.</p>}
      </section>
      <section className="superadmin-card">
        <h2><Link href="/admin/audit-logs">Recent activity</Link></h2>
        {events.length ? <ul className="superadmin-event-list">{events.slice(0, 5).map((event) => <li key={event.id}><strong>{event.action}</strong><span>{event.target}</span></li>)}</ul> : <p>No activity in your assigned sites.</p>}
      </section>
    </main>
  );
}
