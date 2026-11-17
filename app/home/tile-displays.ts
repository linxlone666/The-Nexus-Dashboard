import {
  getCameraMonitoring,
  getMonitoringRecords,
  getPortfolioPrices,
} from "@/data/mock-monitoring-records";
import { getManagedSiteDataset } from "@/data/mock-system-data";
import type { SystemId } from "@/data/mock-system-data";
import type { ManagedSite } from "@/data/management";

export const tileDisplayNames = {
  summary: "Summary",
  cameras: "Camera previews",
  table: "Table",
  bar: "Bar chart",
  line: "Line chart",
  pie: "Pie chart",
  candle: "Candlestick chart",
} as const;

export type TileDisplay = keyof typeof tileDisplayNames;
type TileSource = { key: string; label: string; displays: TileDisplay[] };

const wholeSystems: readonly SystemId[] = [
  "attendance",
  "hr",
  "parking",
  "cctv",
  "alarms",
];

export function tileSources(
  site: ManagedSite | undefined,
  system: SystemId,
): TileSource[] {
  const dataset = site && getManagedSiteDataset(site, system);
  if (!site || !dataset?.rows.length) {
    return [{ key: "summary", label: "System summary", displays: ["summary"] }];
  }

  const sources: TileSource[] = [];
  const cameras = system === "cctv" ? getCameraMonitoring(site) : undefined;
  if (cameras?.cameras.length) {
    sources.push({
      key: "cameras",
      label: "All cameras",
      displays: ["cameras"],
    });
    for (const camera of cameras.cameras) {
      sources.push({
        key: "camera:" + camera.id,
        label: camera.name,
        displays: ["cameras"],
      });
    }
  }
  sources.push({
    key: "summary",
    label: "System summary",
    displays: ["summary"],
  });
  if (dataset.rows.length) {
    for (const metric of dataset.metrics) {
      sources.push({
        key: "metric:" + metric.key,
        label: metric.label,
        displays: dataset.rows.length > 1 ? ["summary", "line"] : ["summary"],
      });
    }
    sources.push({
      key: "history",
      label: "Daily readings",
      displays: ["table", "line"],
    });
  }
  if (system !== "cctv" && getMonitoringRecords(site, system)?.rows.length) {
    sources.push({
      key: "records",
      label: "Monitoring records",
      displays: ["table"],
    });
  }
  if (wholeSystems.includes(system)) {
    sources.push({
      key: "breakdown",
      label: "Category breakdown",
      displays: ["bar", "pie"],
    });
  }
  if (system === "finance" && getPortfolioPrices(site).length) {
    sources.push({
      key: "portfolio",
      label: "Portfolio OHLC prices",
      displays: ["candle"],
    });
  }
  return sources;
}

export function resolveTileSource(
  sources: TileSource[],
  key?: string,
  display?: TileDisplay,
) {
  if (key) return sources.find((source) => source.key === key) ?? sources[0];
  if (display)
    return (
      sources.find((source) => source.displays.includes(display)) ?? sources[0]
    );
  return sources[0];
}

export function resolveTileDisplay(source: TileSource, display?: TileDisplay) {
  return display && source.displays.includes(display)
    ? display
    : source.displays[0];
}
