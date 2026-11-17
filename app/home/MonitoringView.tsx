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
}: {
  site: ManagedSite;
  system: { id: SystemId; name: string };
}) {
  const dataset = getManagedSiteDataset(site, system.id);
  const latest = dataset?.rows.at(-1);
  const prices = system.id === "finance" ? getPortfolioPrices(site) : [];
  const records =
    system.id === "cctv" ? undefined : getMonitoringRecords(site, system.id);

  return (
    <div className="overview-edit-section">
      <header>
        <p className="overview-breadcrumb">NEXUS / MONITORING</p>
        <h1 className="overview-page-title">{system.name}</h1>
        <p className="overview-subtitle">{site.name}</p>
      </header>

      {dataset && latest ? (
        <>
          {system.id === "cctv" && (
            <CameraMonitoring key={site.id} site={site} />
          )}
          <section
            className="monitoring-summary"
            aria-label="Latest system reading"
          >
            <SystemTile
              title="Latest reading"
              display="summary"
              site={site}
              systemId={system.id}
            />
          </section>
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
                          <td key={index}>{formatSystemValue(value, "THB")}</td>
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
                Sample records · {formatSystemDate(latest.date)}
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
                    {records.rows.map((row) => (
                      <tr key={row.join("|")}>
                        {row.map((value, index) => (
                          <td key={records.columns[index]}>
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
            <h2 id="monitoring-history-heading">Daily history</h2>
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
                        <td key={metric.key}>
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
