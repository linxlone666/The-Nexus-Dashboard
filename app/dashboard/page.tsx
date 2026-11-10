import Link from "next/link";
import { UserNavbar } from "@/components/UserNavbar";
import styles from "./page.module.css";

const sections = [
  { id: "activity", label: "Activity", rows: [["Loading dock", "Door held open · 09:42"], ["Main entrance", "Access granted · 09:38"]] },
  { id: "cctv", label: "CCTV", rows: [["Lobby camera", "Online"], ["Loading dock camera", "Online"]] },
  { id: "alarms", label: "Alarms", rows: [["Loading dock", "Open"], ["West stairwell", "Acknowledged"]] },
  { id: "access", label: "Access", rows: [["Main entrance", "Open to staff"], ["Server room", "Restricted"]] },
  { id: "parking", label: "Parking", rows: [["North garage", "38 spaces available"], ["Visitor lot", "26 spaces available"]] },
  { id: "my-views", label: "My views", rows: [["Control room", "Current view"], ["Site security", "Sample view"]] },
] as const;

export default function Dashboard() {
  return (
    <div className={styles.dashboard}>
      <UserNavbar site="Nexus Headquarters" workspace="Control room" user={{ name: "Alex", initials: "AL" }} alarmCount={3} />
      <main className={styles.content}>
        <section id="overview" className={styles.overview}>
          <div className={styles.topline}>
            <p className={styles.breadcrumb}>Nexus / My views / Control room</p>
            <Link href="/">Switch dashboard</Link>
          </div>
          <h1>Operations overview</h1>
          <p className={styles.description}>Demo preview of site activity, security, and parking.</p>
          <dl className={styles.metrics}>
            <div><dt>Active alarms</dt><dd>03</dd></div>
            <div><dt>People on site</dt><dd>1,284</dd></div>
            <div><dt>Parking available</dt><dd>64</dd></div>
          </dl>
        </section>
        <div className={styles.cards}>
          {sections.map(({ id, label, rows }) => (
            <section key={id} id={id} className={styles.section}>
              <h2>{label}</h2>
              <dl className={styles.records}>
                {rows.map(([name, detail]) => <div key={name}><dt>{name}</dt><dd>{detail}</dd></div>)}
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
