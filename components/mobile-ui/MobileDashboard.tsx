import Link from "next/link";
import BottomNavigation from "./BottomNavigation";

type Screen = "overview" | "activity" | "alarms" | "cctv";

const screens: Record<Screen, { title: string; href: string }> = {
  overview: { title: "Overview", href: "/" },
  activity: { title: "Activity", href: "/activity" },
  alarms: { title: "Alarms", href: "/alarms" },
  cctv: { title: "CCTV", href: "/cctv" },
};

function Header({ screen }: { screen: Screen }) {
  if (screen === "overview") {
    return (
      <header className="overview-header">
        <div className="location-label">
          NEXUS / Headquarters <span>▾</span>
        </div>
        <Link className="header-action" href="/activity">
          Search&nbsp;&nbsp; AL
        </Link>
      </header>
    );
  }

  return (
    <header className="page-header">
      <Link href="/" className="back-link">
        ‹ Overview
      </Link>
      <h1>{screens[screen].title}</h1>
    </header>
  );
}

function MetricCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "warning" | "success";
}) {
  return (
    <article className="metric-card">
      <p className="metric-label">{label}</p>
      <p className={`metric-value${tone ? ` ${tone}` : ""}`}>{value}</p>
      <p className={`metric-note${tone === "success" ? " success" : ""}`}>
        {note}
      </p>
    </article>
  );
}

function CameraCard({
  name,
  location,
  view,
}: {
  name: string;
  location: string;
  view: "lobby" | "parking";
}) {
  return (
    <article className={`camera-card camera-${view}`}>
      <span className="camera-live">
        <span aria-hidden="true" /> LIVE / 1080P
      </span>
      <div className="camera-caption">
        <h3>{name}</h3>
        <p>{location}</p>
      </div>
    </article>
  );
}

function ConnectedSystems() {
  return (
    <section className="systems-card" aria-labelledby="systems-heading">
      <h2 id="systems-heading">Connected systems</h2>
      <ul>
        <li>CCTV</li>
        <li>Smart alarm</li>
        <li>Access control</li>
        <li>Smart parking</li>
      </ul>
      <p>All systems operational</p>
    </section>
  );
}

function Overview() {
  return (
    <>
      <section className="overview-intro">
        <h1>Operations overview</h1>
        <div className="overview-status">
          <span>
            Control room <b>▾</b>
          </span>
          <span>
            <i /> Live updates
          </span>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Operations summary">
        <MetricCard label="Cameras online" value="48 / 50" note="2 offline" />
        <MetricCard
          label="Active alarms"
          value="03"
          note="2 high priority"
          tone="warning"
        />
        <MetricCard
          label="People on site"
          value="1,284"
          note="↑ 12.8% today"
          tone="success"
        />
        <MetricCard label="Parking available" value="64" note="Spaces free" />
      </section>

      <section className="attention-card">
        <h2>
          Needs your attention <span>[4 new]</span>
        </h2>
        <article>
          <h3>Restricted area intrusion</h3>
          <p>Server room · High priority · 2m</p>
        </article>
        <article>
          <h3>Emergency exit door opened</h3>
          <p>East wing · High priority · 5m</p>
        </article>
        <Link href="/alarms" className="text-link">
          View all events <span>→</span>
        </Link>
      </section>

      <section className="camera-section">
        <div className="section-heading">
          <h2>Live camera views</h2>
          <Link href="/cctv">View all ›</Link>
        </div>
        <CameraCard
          name="Main lobby"
          location="Building A · Ground floor"
          view="lobby"
        />
      </section>
    </>
  );
}

function Activity() {
  return (
    <>
      <section className="activity-card">
        <div className="activity-card-heading">
          <h2>Access activity</h2>
          <span>Today⌄</span>
        </div>
        <p className="activity-count">2,846 entries</p>
        <p className="activity-change">↑ 8.2% vs. yesterday</p>
        <svg
          className="activity-chart"
          viewBox="0 0 326 112"
          role="img"
          aria-label="Access activity trend increased through the day"
        >
          <path className="chart-grid" d="M0 37H326M0 77H326" />
          <path
            className="chart-line"
            d="M0 75 29 69 60 61 91 26 122 37 153 4 184 20 214 15 245 34 276 9 306 20 326 13"
          />
        </svg>
        <div className="chart-labels">
          <span>00:00</span>
          <span>08:00</span>
          <span>16:00</span>
        </div>
      </section>
      <CameraCard
        name="Parking entrance"
        location="Building A · Basement 1"
        view="parking"
      />
      <ConnectedSystems />
    </>
  );
}

function Alarms() {
  const alarms = [
    {
      priority: "HIGH PRIORITY",
      title: "Restricted area intrusion",
      location: "Building A · Server room",
      level: "high",
    },
    {
      priority: "HIGH PRIORITY",
      title: "Emergency exit opened",
      location: "Building A · East wing",
      level: "high",
    },
    {
      priority: "MEDIUM",
      title: "Smoke sensor review",
      location: "Building B · Storage area",
      level: "medium",
    },
    {
      priority: "LOW PRIORITY",
      title: "Camera connection lost",
      location: "Building A · Loading bay",
      level: "low",
    },
  ];

  return (
    <>
      <section className="alarm-list" aria-label="Active alarms">
        {alarms.map((alarm) => (
          <article
            className={`alarm-card alarm-${alarm.level}`}
            key={alarm.title}
          >
            <p>{alarm.priority}</p>
            <h2>{alarm.title}</h2>
            <span>{alarm.location}</span>
          </article>
        ))}
      </section>
      <ConnectedSystems />
    </>
  );
}

function Cctv() {
  return (
    <>
      <section className="cctv-list" aria-label="Live camera feeds">
        <CameraCard
          name="Main lobby"
          location="Building A · Ground floor"
          view="lobby"
        />
        <CameraCard
          name="Parking entrance"
          location="Building A · Basement 1"
          view="parking"
        />
      </section>
      <ConnectedSystems />
    </>
  );
}

export default function MobileDashboard({ screen }: { screen: Screen }) {
  return (
    <div className={`mobile-app app-${screen}`}>
      <Header screen={screen} />
      <div className={`screen-content screen-${screen}`}>
        {screen === "overview" && <Overview />}
        {screen === "activity" && <Activity />}
        {screen === "alarms" && <Alarms />}
        {screen === "cctv" && <Cctv />}
      </div>
      <BottomNavigation />
    </div>
  );
}
