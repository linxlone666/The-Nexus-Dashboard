import { TileDonut } from "./TileDonut";
import { TileChart } from "./TileChart";
import { formatDemoDate, formatDemoPeriod } from "@/data/demo-dates";
import { DemoCameraVideo } from "@/components/DemoCameraVideo";
import {
  getCameraMonitoring,
  getMonitoringRecords,
  getPortfolioPrices,
} from "@/data/mock-monitoring-records";
import type { ManagedSite } from "@/data/management";
import type { getManagedSiteDataset } from "@/data/mock-system-data";
import type { TileDisplay } from "./tile-displays";

type Dataset = NonNullable<ReturnType<typeof getManagedSiteDataset>>;
type Metric = Dataset["metrics"][number];

function day(value: string) {
  return formatDemoDate(value);
}

function format(value: number) {
  return value.toLocaleString("en-US");
}

function parts(dataset: Dataset, date?: string) {
  const values = (date ? dataset.rows.find((row) => row.date === date) : dataset.rows.at(-1))?.values;
  if (!values) return [];
  switch (dataset.id) {
    case "attendance":
      return [
        { label: "On time", value: values.onTime },
        { label: "Late", value: values.checkedIn - values.onTime },
        { label: "Absent", value: values.expected - values.checkedIn },
      ];
    case "hr":
      return [
        { label: "Not on leave", value: values.headcount - values.onLeave },
        { label: "On leave", value: values.onLeave },
      ];
    case "parking":
      return [
        { label: "Occupied at peak", value: values.peakOccupied },
        {
          label: "Available at peak",
          value: values.capacity - values.peakOccupied,
        },
      ];
    case "cctv":
      return [
        { label: "Online", value: values.online },
        { label: "Offline", value: values.totalCameras - values.online },
      ];
    case "alarms":
      return [
        { label: "Unresolved critical", value: values.critical },
        { label: "Other tracked incidents", value: values.raised - values.critical },
      ];
    default:
      return [];
  }
}

export function TileVisualization({
  site,
  dataset,
  metric,
  display,
  dataKey,
  cameraIds,
  date,
  miniature,
}: {
  site: ManagedSite;
  dataset: Dataset;
  metric: Metric;
  display: Exclude<TileDisplay, "summary">;
  dataKey: string;
  cameraIds?: readonly string[];
  date?: string;
  miniature?: boolean;
}) {
  if (display === "cameras") {
    const available = getCameraMonitoring(site, date)?.cameras ?? [];
    const cameras =
      dataKey === "cameras"
        ? (cameraIds?.flatMap((id) =>
            available.filter((camera) => camera.id === id),
          ) ?? available)
        : available.filter((camera) => dataKey === "camera:" + camera.id);
    if (!cameras.length)
      return <p className="system-tile-empty">No cameras available.</p>;
    return (
      <div
        className="tile-camera-previews"
        data-custom={cameraIds !== undefined}
        aria-label={
          dataKey === "cameras"
            ? "Sample camera feeds from this site"
            : "Selected camera feed"
        }
      >
        {cameras.map(({ id, name, status, footage, changedAt }, index) => (
          <div
            key={id}
            className="tile-camera-preview"
            data-offline={status === "Offline"}
            data-extra={index > 0}
            data-beyond-medium={index > 1}
          >
            <strong title={name}>{name}</strong>
            <span className="tile-status" data-tone={status === "Offline" ? "warning" : "ok"}>{status}</span>
            {changedAt && <small className="camera-tile-updated">
              Updated · {formatDemoDate(changedAt.slice(0, 10))} {changedAt.slice(11)}
            </small>}
            {footage ? (
              <DemoCameraVideo
                name={name}
                footage={footage}
                className="tile-camera-video"
              />
            ) : (
              <small>Feed unavailable</small>
            )}
          </div>
        ))}
        {cameras.length > 1 && <p className="operational-hidden-count compact-count">+{cameras.length - 1} more cameras</p>}
        {cameras.length > 2 && <p className="operational-hidden-count medium-count">+{cameras.length - 2} more cameras</p>}
      </div>
    );
  }

  if (display === "table" && dataKey === "records" && dataset.id !== "cctv") {
    const records = getMonitoringRecords(site, dataset.id, date);
    if (!records?.rows.length)
      return <p className="system-tile-empty">No records available.</p>;
    if (dataset.id === "alarms") {
      const event = records.columns.indexOf("Incident");
      const severity = records.columns.indexOf("Severity");
      const status = records.columns.indexOf("Status");
      const changed = records.columns.indexOf("Last status change");
      return (
        <ol className="tile-recent-events" aria-label="Recent incident updates">
          {records.rows.slice(0, 3).map((row, index) => (
            <li key={String(row[event])} data-row-number={index + 1}>
              <strong>{row[event]}</strong>
              <span className="tile-status" data-tone={row[status] === "Open" ? "warning" : "ok"}>{row[status]}</span>
              <small>{row[changed]} · {row[severity]}</small>
            </li>
          ))}
          {[1, 2, 3].map((shown) => records.rows.length > shown && (
            <li key={shown} className="operational-hidden-count" data-after-rows={shown}>
              +{records.rows.length - shown} more incidents
            </li>
          ))}
        </ol>
      );
    }
    return (
      <div className="tile-record-scroll">
        <table className="tile-data-table tile-records">
          <caption>{records.title}{records.coverage === "sample" ? " · Sample records" : ""}</caption>
          <thead>
            <tr>{records.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {records.rows.slice(0, 3).map((row, index) => (
              <tr key={row.join("|")} data-row-number={index + 1}>
                {row.map((value, index) => (
                  <td key={records.columns[index]} data-number={typeof value === "number"}>
                    {typeof value === "number" ? format(value) : value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (display === "table")
    return (
      <div>
        <table className="tile-data-table">
          <thead>
            <tr>
              <th scope="col">Date</th>
              {[
                metric,
                ...dataset.metrics.filter((item) => item.key !== metric.key),
              ].map(({ key, label, unit }, index) => (
                <th key={key} scope="col" data-secondary={index > 0}>
                  {label}
                  {unit === "count" ? "" : " (" + unit + ")"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...dataset.rows].reverse().map((row, index) => (
              <tr key={row.date} data-row-number={index + 1}>
                <th scope="row">{day(row.date)}</th>
                {[
                  metric,
                  ...dataset.metrics.filter((item) => item.key !== metric.key),
                ].map(({ key }, index) => (
                  <td key={key} data-secondary={index > 0} data-number="true">
                    {Number.isFinite(row.values[key]) ? format(row.values[key]) : "No reading"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  if (display === "pie" || (display === "bar" && dataKey === "breakdown")) {
    const segments = parts(dataset, date);
    const unit = chartUnit(dataset.id, "count");
    if (display === "pie") return <TileDonut segments={segments} unit={unit} />;
    return <TileChart type="bar" title="Category breakdown" unit={unit}
      period={date ? formatDemoDate(date) : undefined}
      series={["Count"]} groups={segments.map(({ label, value }) => ({
        label, values: [Number.isFinite(value) ? value : null],
      }))} />;
  }

  if (display === "candle") {
    const prices = getPortfolioPrices(site);
    if (!prices.length)
      return <p className="system-tile-empty">No price data available.</p>;
    const latest = prices.at(-1)!;
    const min = Math.min(...prices.map(({ low }) => low));
    const max = Math.max(...prices.map(({ high }) => high));
    const pct = (value: number) => (100 * (value - min)) / (max - min || 1);
    return (
      <figure className="tile-chart" data-chart="candle">
        <figcaption>Portfolio close · {format(latest.close)} THB · {formatDemoPeriod()}</figcaption>
        <div className="tile-candles">
          {prices.map(({ date, open, high, low, close }) => (
            <div
              key={date}
              className="tile-chart-column"
              aria-label={
                day(date) +
                ": Open " +
                open +
                ", High " +
                high +
                ", Low " +
                low +
                ", Close " +
                close +
                " THB"
              }
            >
              <span
                className="tile-candle"
                data-up={close >= open}
                aria-hidden="true"
              >
                <i
                  style={{
                    bottom: pct(low) + "%",
                    height: pct(high) - pct(low) + "%",
                  }}
                />
                <b
                  style={{
                    bottom: pct(Math.min(open, close)) + "%",
                    height: Math.abs(pct(close) - pct(open)) + "%",
                  }}
                />
              </span>
              <small>
                {day(date)} · {close}
              </small>
            </div>
          ))}
        </div>
      </figure>
    );
  }

  const financeComparison = dataKey === "finance-comparison";
  const series = financeComparison ? ["Revenue", "Operating cost"] : [metric.label];
  const keys = financeComparison ? ["revenue", "cost"] : [metric.key];
  const groups = dataset.rows.map((row) => ({
    label: day(row.date),
    shortLabel: new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(row.date)),
    values: keys.map((key) => Number.isFinite(row.values[key]) ? row.values[key] : null),
  }));

  return <TileChart
    type={display === "bar" ? "bar" : "line"}
    title={financeComparison ? "Daily revenue and operating cost" : metric.label}
    unit={chartUnit(dataset.id, metric.unit, metric.key)}
    series={series}
    groups={groups}
    period={formatDemoPeriod()}
    miniature={miniature}
  />;
}

function chartUnit(system: Dataset["id"], unit: string, metric?: string) {
  if (unit !== "count") return unit;
  if (system === "parking") return metric === "vehicleEntries" ? "vehicles" : "spaces";
  if (system === "alarms") return "incidents";
  return "count";
}
