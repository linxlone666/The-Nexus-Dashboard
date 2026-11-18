"use client";

import { useState } from "react";

const colors = ["#08786d", "#986326"];
const numbers = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const compactNumbers = new Intl.NumberFormat("en-US", { notation: "compact" });

type ChartGroup = {
  label: string;
  shortLabel?: string;
  values: (number | null)[];
};

export function TileChart({ title, unit, series, groups, type, period, miniature = false }: {
  title: string;
  unit: string;
  series: string[];
  groups: ChartGroup[];
  type: "line" | "bar";
  period?: string;
  miniature?: boolean;
}) {
  const [selected, setSelected] = useState<number>();
  const [focused, setFocused] = useState<number>();
  const [hovered, setHovered] = useState<number>();
  const values = groups.flatMap((group) => group.values).filter((value): value is number => value !== null && Number.isFinite(value));
  if (!values.length) return <p className="system-tile-empty">No readings for this period.</p>;

  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const step = Math.pow(10, Math.floor(Math.log10((max - min || 1) / 2)));
  const interval = Math.ceil((max - min || 1) / (2 * step)) * step;
  const lower = Math.floor(min / interval) * interval;
  const upper = Math.max(lower + interval, Math.ceil(max / interval) * interval);
  const position = (value: number) => (value - lower) / (upper - lower) * 100;
  const ticks = Array.from({ length: Math.round((upper - lower) / interval) + 1 },
    (_, index) => lower + index * interval);
  const active = groups[hovered ?? focused ?? selected ?? -1];
  const describe = (group: ChartGroup) => group.values.map((value, index) =>
    series[index] + " " + (value === null ? "No reading" : numbers.format(value) + " " + unit),
  ).join(" · ");
  const latest = groups.at(-1);
  const x = (index: number) => (index + 0.5) * 100 / groups.length;

  return (
    <figure className="nexus-reading-chart" data-miniature={miniature} aria-label={title + " (" + unit + ")"}>
      {!miniature && (
        <figcaption className="reading-chart-caption">
          <span>{title} ({unit})</span>
          {latest && <strong>{series.length > 1 ? describe(latest) :
            latest.values[0] === null ? "No reading" : numbers.format(latest.values[0]) + " " + unit}</strong>}
          {period && <small>{period}</small>}
        </figcaption>
      )}
      {!miniature && series.length > 1 && (
        <ul className="reading-chart-legend">
          {series.map((label, index) => (
            <li key={label}><span style={{ background: colors[index] }} />{label}</li>
          ))}
        </ul>
      )}
      <div className="reading-chart-plot" aria-label={title + " (" + unit + ")"}>
        {ticks.map((tick) => (
          <div className="reading-chart-gridline" key={tick} style={{ bottom: position(tick) + "%" }}>
            {!miniature && <span title={numbers.format(tick)}>{compactNumbers.format(tick)}</span>}
          </div>
        ))}
        {type === "line" && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {groups.slice(1).map((group, index) => {
              const before = groups[index].values[0];
              const after = group.values[0];
              return before !== null && after !== null && (
                <line key={group.label} x1={x(index)} x2={x(index + 1)}
                  y1={100 - position(before)} y2={100 - position(after)}
                  stroke={colors[0]} strokeWidth="2" vectorEffect="non-scaling-stroke" />
              );
            })}
          </svg>
        )}
        <div className="reading-chart-groups" style={{ gridTemplateColumns: "repeat(" + groups.length + ", minmax(0, 1fr))" }}>
          {groups.map((group, index) => (
            <div className="reading-chart-group" key={group.label}>
              <button type="button" className="reading-chart-point"
                aria-label={group.label + " · " + describe(group)}
                aria-pressed={selected === index}
                onClick={() => setSelected(selected === index ? undefined : index)}
                onFocus={() => setFocused(index)}
                onBlur={() => setFocused(undefined)}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") setHovered(index); }}
                onPointerLeave={() => setHovered(undefined)}>
                {group.values.map((value, seriesIndex) => {
                  const height = value === null ? 0 : Math.abs(position(value) - position(0));
                  const mark = value === null ? "missing" : type === "line" ? "dot" : "bar";
                  return <span key={series[seriesIndex]} aria-hidden="true" data-mark={mark}
                    style={{
                      left: group.values.length === 1 ? "50%" : (32 + seriesIndex * 36) + "%",
                      bottom: (value === null ? 0 : type === "line" ? position(value) : position(Math.min(value, 0))) + "%",
                      height: mark === "bar" ? "max(2px, " + height + "%)" : undefined,
                      background: value === null ? undefined : colors[seriesIndex],
                    }}>{value === null ? "×" : null}</span>;
                })}
              </button>
              {!miniature && <span className="reading-chart-x" title={group.label}>{group.shortLabel ?? group.label}</span>}
            </div>
          ))}
        </div>
      </div>
      <p className="reading-chart-detail" data-active={Boolean(active)} aria-live="polite">
        {active ? active.label + " · " + describe(active) : ""}
      </p>
    </figure>
  );
}
