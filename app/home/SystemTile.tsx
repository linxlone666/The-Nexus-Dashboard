import { getCameraMonitoring } from "@/data/mock-monitoring-records";
import { getIncidentState } from "@/data/mock-security-events";
import { formatDemoDate, formatDemoPeriod } from "@/data/demo-dates";
import { TileVisualization } from "./TileVisualization";
import {
  resolveTileDisplay,
  resolveTileSource,
  tileSources,
} from "./tile-displays";
import type { TileDisplay } from "./tile-displays";
import type { ManagedSite } from "@/data/management";
import Link from "next/link";
import { getManagedSiteDataset } from "@/data/mock-system-data";
import type { SystemId } from "@/data/mock-system-data";

const primaryMetrics: Partial<Record<SystemId, string>> = {
  attendance: "checkedIn",
  energy: "usage",
  cctv: "online",
  alarms: "critical",
  parking: "peakOccupied",
  projects: "progress",
};

const number = new Intl.NumberFormat("en-US");

export function formatSystemValue(value: number, unit: string) {
  if (unit === "%") return number.format(value) + "%";
  if (unit === "count") return number.format(value);
  return number.format(value) + " " + unit;
}

export function formatSystemDate(value: string) {
  return formatDemoDate(value);
}

export function SystemTile({
  title,
  site,
  systemId,
  display,
  dataKey,
  cameraIds,
  date,
  onOpen,
  preview = false,
}: {
  title: string;
  site?: ManagedSite;
  systemId: SystemId;
  display?: TileDisplay;
  dataKey?: string;
  cameraIds?: readonly string[];
  date?: string;
  onOpen?: () => void;
  preview?: boolean;
}) {
  const dataset = site ? getManagedSiteDataset(site, systemId) : undefined;
  const sources = tileSources(site, systemId);
  const missingDevice =
    dataKey?.startsWith("camera:") &&
    !sources.some((source) => source.key === dataKey);
  const source = resolveTileSource(sources, dataKey, display);
  const format = resolveTileDisplay(source, display);
  const latest = date
    ? dataset?.rows.find((row) => row.date === date)
    : dataset?.rows.at(-1);
  const dayIndex = dataset?.rows.findIndex((row) => row.date === latest?.date) ?? -1;
  const previous = dayIndex > 0 ? dataset?.rows[dayIndex - 1] : undefined;
  const readingScope = ["cctv", "alarms", "hr", "crm"].includes(systemId)
    ? "End of day"
    : "Daily";
  const showsHistory =
    format === "line" ||
    format === "candle" ||
    (format === "bar" && source.key !== "breakdown") ||
    source.key === "history";
  const primary =
    dataset?.metrics.find(
      ({ key }) =>
        key ===
        (source.key.startsWith("metric:")
          ? source.key.slice(7)
          : primaryMetrics[systemId]),
    ) ?? dataset?.metrics[0];

  const value = latest && primary ? latest.values[primary.key] : undefined;
  const previousValue = previous && primary ? previous.values[primary.key] : undefined;
  const change = value != null && previousValue != null ? value - previousValue : undefined;
  const unit = primary?.unit ?? "count";
  const values = latest?.values;
  const limit = values && (systemId === "energy" && primary?.key === "usage"
    ? { value: values.usage, max: values.budget, unit: "kWh", label: "Daily target" }
    : systemId === "parking" && primary?.key === "peakOccupied"
      ? { value: values.peakOccupied, max: values.capacity, unit: "spaces", label: "Capacity" }
      : undefined);
  const incidents = systemId === "alarms" && latest ? getIncidentState(latest.date) : [];
  const pending = incidents.filter((incident) => incident.status === "Open").length;
  const reviewed = incidents.length - pending;
  const cameraData = systemId === "cctv" && site && latest ? getCameraMonitoring(site, latest.date) : undefined;
  const operational = systemId === "energy" || systemId === "cctv" || systemId === "finance" ||
    systemId === "alarms" || systemId === "parking";
  const needsReview = pending > 0;
  const energyChange = systemId === "energy" && values && previous
    ? values.usage - previous.values.usage
    : undefined;
  const facts: { label: string; value: string }[] = values ? (() => {
    switch (systemId) {
      case "energy":
        return [
          { label: "Electricity used", value: formatSystemValue(values.usage, "kWh") },
          ...(energyChange === undefined || !previous ? [] : [{
            label: "vs " + formatDemoDate(previous.date),
            value: new Intl.NumberFormat("en-US", { signDisplay: "exceptZero" }).format(energyChange) + " kWh",
          }]),
          { label: "Daily target", value: formatSystemValue(values.budget, "kWh") },
        ];
      case "cctv":
        return [
          { label: "Online cameras", value: number.format(values.online) },
          { label: "Offline cameras", value: number.format(values.totalCameras - values.online) },
        ];
      case "finance":
        return [
          { label: "Daily revenue", value: formatSystemValue(values.revenue, "THB") },
          { label: "Operating cost", value: formatSystemValue(values.cost, "THB") },
          { label: "Net operating result", value: formatSystemValue(values.revenue - values.cost, "THB") },
        ];
      case "alarms":
        return [
          { label: "Needs review", value: pending + (pending === 1 ? " incident" : " incidents") },
          { label: "Reviewed or resolved", value: reviewed + (reviewed === 1 ? " incident" : " incidents") },
        ];
      case "parking": {
        const available = values.capacity - values.peakOccupied;
        return [
          { label: "Available at peak", value: available + " spaces" },
          { label: "Occupied at peak", value: values.peakOccupied + " spaces" },
          { label: "Capacity", value: values.capacity + " spaces" },
          { label: "Peak occupancy", value: values.capacity > 0 ? Math.round(values.peakOccupied / values.capacity * 100) + "%" : "No capacity recorded" },
        ];
      }
      default:
        return [];
    }
  })() : [];
  const status = values && (systemId === "cctv"
    ? (values.totalCameras > values.online ? (values.totalCameras - values.online) + " Offline" : "All cameras online")
    : systemId === "alarms"
      ? (needsReview ? "Needs review" : values.raised > values.resolved ? "Reviewed · awaiting resolution" : "No open incidents")
      : limit
        ? (systemId === "parking"
          ? (limit.value >= limit.max ? "Full" : "Spaces available")
          : (limit.value > limit.max ? "Above daily target" : "Within daily target"))
        : undefined);
  const warning = Boolean(values && (
    (systemId === "cctv" && values.online < values.totalCameras) ||
    needsReview ||
    (limit && (systemId === "parking" ? limit.value >= limit.max : limit.value > limit.max))
  ));

  const showsTable = format === "table" || (format === "summary" && systemId === "alarms");
  const viewLabel = showsTable ? "View all" : "View details";

  return (
    <article className="system-tile" data-format={format} data-operational={operational} data-system={systemId}>
      <header className="system-tile-header">
        <h3 title={title}>
          {onOpen ? <button type="button" onClick={onOpen}>{title}</button> : title}
        </h3>
        {latest && <span className="system-tile-source">Daily sample</span>}
      </header>

      {missingDevice ? (
        <p className="system-tile-empty">The selected camera is unavailable.</p>
      ) : site && dataset && latest && primary ? (
        <>
          <div className="system-tile-body">
            {facts.length > 0 && (
              <dl className="operational-metrics">
                {facts.map(({ label, value }, index) => (
                  <div key={label} className={index === 0 ? "system-tile-primary" : undefined}>
                    <dt>{label}</dt><dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {!operational && (["summary", "line"].includes(format) || (format === "bar" && source.key.startsWith("metric:"))) && (
              <dl className="system-tile-metrics">
                <div className="system-tile-primary">
                  <dt>{primary.label}</dt>
                  <dd>
                    {formatSystemValue(
                      latest.values[primary.key],
                      primary.unit,
                    )}
                  </dd>
                </div>
                {source.key === "summary" &&
                  dataset.metrics
                    .filter(({ key }) => key !== primary.key)
                    .map((metric) => (
                      <div
                        key={metric.key}
                        className="system-tile-secondary"
                        data-important={["critical", "offline"].includes(
                          metric.key,
                        )}
                      >
                        <dt>{metric.label}</dt>
                        <dd>
                          {formatSystemValue(
                            latest.values[metric.key],
                            metric.unit,
                          )}
                        </dd>
                      </div>
                    ))}
              </dl>
            )}
            {format === "summary" && status && systemId !== "cctv" && systemId !== "alarms" && (
              <div className="tile-indicators">
                <span className="tile-status" data-tone={warning ? "warning" : "ok"}>{status}</span>
                {limit && (
                  <div className="tile-limit">
                    <meter min={0} max={limit.max} value={Math.min(limit.value, limit.max)}
                      aria-label={limit.label + " " + limit.value + " of " + limit.max + " " + limit.unit} />
                    <span>{number.format(limit.value)} / {number.format(limit.max)} {limit.unit} · {limit.label}</span>
                  </div>
                )}
              </div>
            )}
            {format === "summary" && dataset.rows.length > 1 && (!operational || systemId === "energy") && (
              <div className="system-tile-mini-trend" aria-label={primary.label + " · " + formatDemoPeriod()}>
                <TileVisualization
                  site={site}
                  dataset={dataset}
                  metric={primary}
                  display="line"
                  miniature
                  dataKey={"metric:" + primary.key}
                />
                <small className="system-tile-trend-period">{formatDemoPeriod()}</small>
              </div>
            )}
            {format === "summary" && operational && (
              <div className="operational-visual">
                {systemId === "cctv" && cameraData && (
                  <TileVisualization site={site} dataset={dataset} metric={primary} display="cameras"
                    dataKey="cameras" date={latest.date} />
                )}
                {systemId === "alarms" && (
                  <TileVisualization site={site} dataset={dataset} metric={primary} display="table"
                    dataKey="records" date={latest.date} />
                )}
                {systemId === "finance" && (
                  <TileVisualization site={site} dataset={dataset} metric={primary} display="bar"
                    dataKey="finance-comparison" date={latest.date} />
                )}
                {systemId === "parking" && (
                  <TileVisualization site={site} dataset={dataset} metric={primary} display="pie"
                    dataKey="breakdown" date={latest.date} />
                )}
                {systemId === "energy" && (
                  <TileVisualization site={site} dataset={dataset} metric={primary} display="line"
                    dataKey="metric:usage" date={latest.date} />
                )}
              </div>
            )}
            {format !== "summary" && (
              <TileVisualization
                site={site}
                dataset={dataset}
                metric={primary}
                display={format}
                dataKey={source.key}
                cameraIds={cameraIds}
                date={latest.date}
              />
            )}
          </div>
          <footer className="system-tile-footer">
            <span title={showsHistory ? "Daily history · " + formatDemoPeriod() : "Daily reading · " + formatDemoDate(latest.date)}>
              {showsHistory ? formatDemoPeriod() : <>{readingScope} · <time dateTime={latest.date}>{formatDemoDate(latest.date)}</time></>}
              {!operational && format === "summary" && previous && change !== undefined && (
                <span className="system-tile-previous">
                  {" · " + (change > 0 ? "+" : change < 0 ? "−" : "") +
                    formatSystemValue(Math.abs(change), unit === "%" ? "percentage points" : unit) +
                    " vs " + formatDemoDate(previous.date)}
                </span>
              )}
            </span>
            {(onOpen || preview) && (
              <button
                type="button"
                onClick={onOpen}
                disabled={preview}
                aria-label={showsTable ? "View all records" : "View details"}
                title={showsTable ? "View all records" : "View details"}
              >
                <span>{viewLabel}</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 8h9M8 4l4 4-4 4" />
                </svg>
              </button>
            )}
          </footer>
        </>
      ) : (
        <p className="system-tile-empty">
          {site ? (
            site.source?.kind === "rest" ? (
              "No readings imported yet. This source is configured for REST."
            ) : (
              "No data for this site."
            )
          ) : (
            <Link href="/login/sites">Choose a site to view data</Link>
          )}
        </p>
      )}
    </article>
  );
}
