"use client";

import { useState } from "react";
import { demoDates, latestDemoDate, formatDemoPeriod } from "@/data/demo-dates";
import { TileVisualization } from "./TileVisualization";
import { CameraMonitoring } from "./CameraMonitoring";
import {
  getMonitoringRecords,
  getPortfolioPrices,
} from "@/data/mock-monitoring-records";
import { SystemTile, formatSystemValue, formatSystemDate } from "./SystemTile";
import { getManagedSiteDataset } from "@/data/mock-system-data";
import type { SystemId } from "@/data/mock-system-data";
import type { ManagedSite } from "@/data/management";

export function MonitoringView({
  site,
  system,
  date,
}: {
  site: ManagedSite;
  system: { id: SystemId; name: string };
  date?: string;
}) {
  const dataset = getManagedSiteDataset(site, system.id);
  const [localDate, setLocalDate] = useState<string>(latestDemoDate);
  const selectedDate = date ?? localDate;
  const latest = dataset?.rows.find((row) => row.date === selectedDate);
  const prices = system.id === "finance" ? getPortfolioPrices(site).filter((row) => row.date === selectedDate) : [];
  const records =
    system.id === "cctv" ? undefined : getMonitoringRecords(site, system.id, selectedDate);

  return (
    <div className="overview-edit-section">
      <header>
        <p className="overview-breadcrumb">NEXUS / MONITORING</p>
        <h1 className="overview-page-title">{system.name}</h1>
        <p className="overview-subtitle">{site.name} · Sample period · {formatDemoPeriod()}</p>
        {!date && (
          <label className="monitoring-day-picker">
            Sample day
            <select aria-label="Sample day" value={selectedDate} onChange={(event) => setLocalDate(event.target.value)}>
              {demoDates.map((day) => <option key={day} value={day}>{formatSystemDate(day)}</option>)}
            </select>
          </label>
        )}
        <p className="overview-subtitle">Daily totals and end-of-day state · {formatSystemDate(selectedDate)}</p>
      </header>

      {dataset && latest ? (
        <>
          {system.id === "cctv" && (
            <CameraMonitoring key={site.id + selectedDate} site={site} date={selectedDate} />
          )}
          <section
            className="monitoring-summary"
            aria-label="Selected day reading"
          >
            <SystemTile
              title={"Daily reading · " + formatSystemDate(selectedDate)}
              display="summary"
              site={site}
              systemId={system.id}
              date={selectedDate}
            />
          </section>
          {system.id === "finance" && (
            <section className="monitoring-history" aria-label="Daily finance comparison">
              <TileVisualization site={site} dataset={dataset} metric={dataset.metrics[0]}
                display="bar" dataKey="finance-comparison" date={selectedDate} />
            </section>
          )}
          {prices.length > 0 && (
            <section
              className="monitoring-history"
              aria-label="Demo portfolio prices"
            >
              <h2>Demo portfolio prices (THB)</h2>
              <div className="monitoring-table-scroll">
                <table>
                  <thead>
                    <tr>
                      {["Date", "Open", "High", "Low", "Close"].map((label) => (
                        <th key={label} scope="col">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(({ date, open, high, low, close }) => (
                      <tr key={date}>
                        <th scope="row">{formatSystemDate(date)}</th>
                        {[open, high, low, close].map((value, index) => (
                          <td key={index} data-number="true">{formatSystemValue(value, "THB")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          {records && (
            <section
              className="monitoring-history"
              aria-labelledby="monitoring-records-heading"
            >
              <h2 id="monitoring-records-heading">{records.title}</h2>
              <p className="monitoring-record-date">
                {records.coverage === "sample"
                  ? "Sample records (รายการตัวอย่าง)"
                  : records.coverage === "complete"
                    ? "Complete demo register"
                    : "Daily measurements and end-of-day values"} · {formatSystemDate(selectedDate)}
              </p>
              <div className="monitoring-table-scroll">
                <table className="monitoring-records">
                  <thead>
                    <tr>
                      {records.columns.map((column) => (
                        <th key={column} scope="col">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {!records.rows.length && (
                      <tr><td colSpan={records.columns.length}>No records for this day.</td></tr>
                    )}
                    {records.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((value, index) => (
                          <td key={records.columns[index]} data-number={typeof value === "number"}>
                            {typeof value === "number"
                              ? formatSystemValue(value, "count")
                              : value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <section
            className="monitoring-history"
            aria-labelledby="monitoring-history-heading"
          >
            <h2 id="monitoring-history-heading">Daily history · {formatDemoPeriod()}</h2>
            <div className="monitoring-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    {dataset.metrics.map((metric) => (
                      <th scope="col" key={metric.key}>
                        {metric.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...dataset.rows].reverse().map((row) => (
                    <tr key={row.date}>
                      <th scope="row">
                        <time dateTime={row.date}>
                          {formatSystemDate(row.date)}
                        </time>
                      </th>
                      {dataset.metrics.map((metric) => (
                        <td key={metric.key} data-number="true">
                          {formatSystemValue(
                            row.values[metric.key],
                            metric.unit,
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <section className="monitoring-history">
          <h2>No readings yet</h2>
          <p className="overview-subtitle">
            {site.source?.kind === "rest"
              ? "This system is configured for REST, but no data has been imported."
              : "No sample readings are available for this system."}
          </p>
        </section>
      )}
    </div>
  );
}
