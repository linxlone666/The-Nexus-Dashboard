import { demoDates, latestDemoDate, formatDemoDate } from "@/data/demo-dates";
import { useState } from "react";
import type { ManagedSite } from "@/data/management";
import type { SystemId } from "@/data/mock-system-data";
import { DashboardGrid } from "./DashboardGrid";
import { MonitoringView } from "./MonitoringView";
import { SystemTile } from "./SystemTile";
import { emptyLayout, filterDashboardLayout, tileIds, tileSystem, type DashboardLayout } from "./dashboard-layout";
import { saveMonitoringLayout, useMonitoringLayout } from "./saved-dashboards";

export function MonitoringLayout({ site, system, mobile, scope, onBack, initialDate }: {
  site: ManagedSite;
  system: { id: SystemId; name: string };
  mobile: boolean;
  scope: string;
  onBack: () => void;
  initialDate?: string;
}) {
  const [selectedDate, setSelectedDate] = useState<string>(demoDates.find((day) => day === initialDate) ?? latestDemoDate);
  const saved = useMonitoringLayout(scope, system.id);
  const [draft, setDraft] = useState<DashboardLayout | null>(null);
  const [error, setError] = useState("");
  const kinds = tileIds.filter((kind) => tileSystem(kind) === system.id);
  const layout = draft ?? saved;
  const starterTile = kinds[0];
  const starterLayout: DashboardLayout = {
    ...emptyLayout,
    tiles: starterTile ? {
      [starterTile]: { kind: starterTile, columns: 2, rows: 1, display: "summary", dataKey: "summary" },
    } : {},
  };
  function save(layout: DashboardLayout | null) {
    try {
      saveMonitoringLayout(site.id, system.id, layout && filterDashboardLayout(layout, [system.id]));
      setDraft(null);
      setError("");
    } catch {
      setError("This browser could not save the monitoring layout.");
    }
  }
  return (
    <div className="overview-edit-section">
      <div className="overview-heading-actions">
        <button type="button" className="overview-secondary-button" onClick={onBack}>Back to Dashboard</button>
        {!mobile && (draft ? <>
          <button type="button" className="overview-secondary-button" onClick={() => { setDraft(null); setError(""); }}>Cancel</button>
          <button type="button" className="overview-save-button" onClick={() => save(draft)}>Save monitoring layout</button>
        </> : <>
          <button type="button" className="overview-secondary-button" onClick={() => setDraft(saved ?? starterLayout)}>Edit system layout</button>
          {saved && <button type="button" className="overview-secondary-button" onClick={() => save(null)}>Restore default</button>}
        </>)}
      </div>
      <label className="monitoring-day-picker">
        Sample day
        <select aria-label="Sample day" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
          {demoDates.map((day) => <option key={day} value={day}>{formatDemoDate(day)}</option>)}
        </select>
      </label>
      {error && <p role="alert">{error}</p>}
      {layout ? <>
        <h1 className="overview-page-title">{system.name}</h1>
        <DashboardGrid
          key={draft ? "edit" : "view"}
          layout={filterDashboardLayout(layout, [system.id])}
          availableKinds={kinds}
          mobile={mobile}
          site={site}
          editing={!mobile && !!draft}
          onChange={setDraft}
          renderTile={(kind, title, display, _preview, dataKey, cameraIds) => (
            <SystemTile title={title} site={site} systemId={tileSystem(kind)} display={display} dataKey={dataKey} cameraIds={cameraIds} date={selectedDate} />
          )}
        />
        <details><summary>Full system details</summary><MonitoringView site={site} system={system} date={selectedDate} /></details>
      </> : <MonitoringView site={site} system={system} date={selectedDate} />}
    </div>
  );
}
