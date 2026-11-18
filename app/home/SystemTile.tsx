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
  cctv: "online",
  parking: "peakOccupied",
  projects: "progress",
};

const number = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatSystemValue(value: number, unit: string) {
  if (unit === "%") return number.format(value) + "%";
  if (unit === "count") return number.format(value);
  return number.format(value) + " " + unit;
}

export function formatSystemDate(value: string) {
  return date.format(new Date(value));
}

export function SystemTile({
  title,
  site,
  systemId,
  display,
  dataKey,
  cameraIds,
  onOpen,
}: {
  title: string;
  site?: ManagedSite;
  systemId: SystemId;
  display?: TileDisplay;
  dataKey?: string;
  cameraIds?: readonly string[];
  onOpen?: () => void;
}) {
  const dataset = site ? getManagedSiteDataset(site, systemId) : undefined;
  const sources = tileSources(site, systemId);
  const missingDevice =
    dataKey?.startsWith("camera:") &&
    !sources.some((source) => source.key === dataKey);
  const source = resolveTileSource(sources, dataKey, display);
  const format = resolveTileDisplay(source, display);
  const latest = dataset?.rows.at(-1);
  const previous = dataset?.rows.at(-2);
  const primary =
    dataset?.metrics.find(
      ({ key }) =>
        key ===
        (source.key.startsWith("metric:")
          ? source.key.slice(7)
          : primaryMetrics[systemId]),
    ) ?? dataset?.metrics[0];

  return (
    <article className="system-tile" data-format={format}>
      <header className="system-tile-header">
        <h3 title={title}>{title}</h3>
        {latest && <span className="system-tile-source">Sample data</span>}
      </header>

      {missingDevice ? (
        <p className="system-tile-empty">The selected camera is unavailable.</p>
      ) : site && dataset && latest && primary ? (
        <>
          <div className="system-tile-body">
            {["summary", "line"].includes(format) && (
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
            {format !== "summary" && (
              <TileVisualization
                site={site}
                dataset={dataset}
                metric={primary}
                display={format}
                dataKey={source.key}
                cameraIds={cameraIds}
              />
            )}
          </div>
          <footer className="system-tile-footer">
            <span>
              <time dateTime={latest.date}>
                {formatSystemDate(latest.date)}
              </time>
              {format === "summary" && previous && (
                <span className="system-tile-previous">
                  {" · Previous: " +
                    formatSystemValue(
                      previous.values[primary.key],
                      primary.unit,
                    )}
                </span>
              )}
            </span>
            {onOpen && (
              <button
                type="button"
                onClick={onOpen}
                aria-label="View monitoring"
                title="View monitoring"
              >
                <span>View monitoring</span>
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
              "No readings imported yet."
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
