import { Navbar } from "@/components/Navbar";
import styles from "./page.module.css";

const sections = [
  ["activity", "Activity"],
  ["cctv", "CCTV"],
  ["alarms", "Alarms"],
  ["access", "Access"],
  ["parking", "Parking"],
  ["my-views", "My views"],
  ["edit", "Edit dashboard"],
];

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <Navbar
        site="Nexus Headquarters"
        workspace="Control room"
        user={{ name: "Alex", initials: "AL" }}
        alarmCount={3}
      />
      <main className={styles.content}>
        <section id="overview" className={styles.overview}>
          <p className={styles.breadcrumb}>Nexus / My views / Control room</p>
          <h1>Operations overview</h1>
          <dl className={styles.metrics}>
            <div><dt>Active alarms</dt><dd>03</dd></div>
            <div><dt>People on site</dt><dd>1,284</dd></div>
            <div><dt>Parking available</dt><dd>64</dd></div>
          </dl>
        </section>
        {sections.map(([id, label]) => (
          <section key={id} id={id} className={styles.section}>
            <h2>{label}</h2>
            <p>This view is not connected yet.</p>
          </section>
        ))}
      </main>
    </div>
  );
}
