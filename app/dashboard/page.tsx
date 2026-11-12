"use client";

import Link from "next/link";
import { useDemoSession } from "@/utils/demo-session";
import { hasPermission } from "@/utils/permissions";
import { SignOutButton } from "@/components/SignOutButton";
import { sections, dashboardMetrics } from "@/data/dashboard";
import { UserNavbar } from "@/components/UserNavbar";
import styles from "./page.module.css";

export default function Dashboard() {
  const { credential, access } = useDemoSession();
  return (
    <div className={styles.dashboard}>
      <UserNavbar
        site="Nexus Headquarters"
        workspace="Control room"
        user={{ name: "Alex", initials: "AL" }}
        alarmCount={3}
      />
      <main className={styles.content}>
        <section id="overview" className={styles.overview}>
          <div className={styles.topline}>
            <p className={styles.breadcrumb}>Nexus / My views / Control room</p>
            <div>
              <Link href="/dashboard/overview">Overview preview</Link>{" "}
              {hasPermission(credential?.role, access, "Access Projects") && (
                <Link href="/dashboard/projects">My projects</Link>
              )}{" "}
              <SignOutButton />
            </div>
          </div>
          <h1>Operations overview</h1>
          <p className={styles.description}>
            Demo preview of site activity, security, and parking.
          </p>
          <dl className={styles.metrics}>
            {dashboardMetrics.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
        <div className={styles.cards}>
          {sections.map(({ id, label, rows }) => (
            <section key={id} id={id} className={styles.section}>
              <h2>{label}</h2>
              <dl className={styles.records}>
                {rows.map(([name, detail]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{detail}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
        <section id="edit" className={styles.section}>
          <h2>Edit dashboard</h2>
          <p>Dashboard editing is unavailable in this preview.</p>
        </section>
      </main>
    </div>
  );
}
