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

const colors = ["#08786d", "#6ca598", "#a9692b"];

function day(value: string) {
  return value.slice(8, 10) + "/" + value.slice(5, 7);
}

function format(value: number) {
  return value.toLocaleString("en-US");
}

function parts(dataset: Dataset) {
  const values = dataset.rows.at(-1)?.values;
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
        { label: "Critical", value: values.critical },
        { label: "Other alarms", value: values.raised - values.critical },
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
}: {
  site: ManagedSite;
  dataset: Dataset;
  metric: Metric;
  display: Exclude<TileDisplay, "summary">;
  dataKey: string;
}) {
  if (display === "cameras") {
    const cameras =
      getCameraMonitoring(site)?.cameras.filter(
        (camera) => dataKey === "cameras" || dataKey === "camera:" + camera.id,
      ) ?? [];
    if (!cameras.length)
      return <p className="system-tile-empty">No cameras available.</p>;
    return (
      <div
        className="tile-camera-previews"
        aria-label={
          dataKey === "cameras"
            ? "Sample camera feeds from this site"
            : "Selected camera feed"
        }
      >
        {cameras.map(({ id, name, status }, index) => (
          <div
            key={id}
            className="tile-camera-preview"
            data-offline={status === "Offline"}
            data-extra={index > 0 && status !== "Offline"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <use href="/nexus-navigation.svg#camera" />
            </svg>
            <strong title={name}>{name}</strong>
            <small>
              {status}
              <span>{status === "Online" ? " · Demo preview" : ""}</span>
            </small>
          </div>
        ))}
      </div>
    );
  }

  if (display === "table" && dataKey === "records" && dataset.id !== "cctv") {
    const records = getMonitoringRecords(site, dataset.id);
    if (!records?.rows.length)
      return <p className="system-tile-empty">No records available.</p>;
    return (
      <table className="tile-data-table tile-records">
        <caption>{records.title}</caption>
        <thead>
          <tr>
            {records.columns.map((column) => (
              <th scope="col" key={column} title={column}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.rows.map((row, index) => (
            <tr key={row.join("|")} data-extra={index > 0}>
              {row.map((value, index) => (
                <td key={records.columns[index]} title={String(value)}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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
              <tr key={row.date} data-extra={index > 0}>
                <th scope="row">{day(row.date)}</th>
                {[
                  metric,
                  ...dataset.metrics.filter((item) => item.key !== metric.key),
                ].map(({ key }, index) => (
                  <td key={key} data-secondary={index > 0}>
                    {format(row.values[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

  if (display === "pie" || display === "bar") {
    const segments = parts(dataset);
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    if (!total) return <p className="system-tile-empty">No totals to chart.</p>;
    if (display === "bar")
      return (
        <figure className="tile-chart" data-chart="bar">
          <figcaption>Category breakdown</figcaption>
          <div className="tile-chart-values">
            {segments.map(({ label, value }) => (
              <div className="tile-chart-column" key={label}>
                <span className="tile-bar-track" aria-hidden="true">
                  <span
                    style={{
                      height:
                        (100 * value) /
                          Math.max(...segments.map((item) => item.value)) +
                        "%",
                    }}
                  />
                </span>
                <strong>{format(value)}</strong>
                <small title={label}>{label}</small>
              </div>
            ))}
          </div>
        </figure>
      );
    const gradient = segments
      .map(({ value }, index) => {
        const before = segments
          .slice(0, index)
          .reduce((sum, segment) => sum + segment.value, 0);
        const start = (100 * before) / total;
        const end = (100 * (before + value)) / total;
        return colors[index] + " " + start + "% " + end + "%";
      })
      .join(", ");
    return (
      <div className="tile-pie">
        <div
          aria-hidden="true"
          style={{ background: "conic-gradient(" + gradient + ")" }}
        />
        <ul>
          {segments.map(({ label, value }, index) => (
            <li key={label} style={{ borderColor: colors[index] }}>
              {label}: <strong>{format(value)}</strong>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (display === "candle") {
    const prices = getPortfolioPrices(site);
    if (!prices.length)
      return <p className="system-tile-empty">No price data available.</p>;
    const min = Math.min(...prices.map(({ low }) => low));
    const max = Math.max(...prices.map(({ high }) => high));
    const pct = (value: number) => (100 * (value - min)) / (max - min || 1);
    return (
      <figure className="tile-chart" data-chart="candle">
        <figcaption>Demo portfolio price (THB)</figcaption>
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

  const points = dataset.rows.map((row) => ({
    date: row.date,
    value: row.values[metric.key],
  }));
  const max = Math.max(1, ...points.map(({ value }) => value));
  const label =
    metric.label + (metric.unit === "count" ? "" : " (" + metric.unit + ")");
  return (
    <figure className="tile-chart" data-chart="line">
      <figcaption>{label}</figcaption>
      {display === "line" && (
        <svg
          className="tile-line"
          aria-hidden="true"
          viewBox="0 0 100 50"
          preserveAspectRatio="none"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            points={points
              .map(
                ({ value }, index) =>
                  (100 * (index + 0.5)) / points.length +
                  "," +
                  (48 - (44 * value) / max),
              )
              .join(" ")}
          />
        </svg>
      )}
      <div className="tile-chart-values">
        {points.map(({ date, value }) => (
          <div className="tile-chart-column" key={date}>
            <strong>{format(value)}</strong>
            <small>{day(date)}</small>
          </div>
        ))}
      </div>
    </figure>
  );
}
