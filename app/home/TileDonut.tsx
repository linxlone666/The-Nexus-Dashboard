const colors = ["#08786d", "#6ca598", "#a9692b"];
const number = new Intl.NumberFormat("en-US");
const percentage = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function TileDonut({ segments, unit }: {
  segments: { label: string; value: number }[];
  unit: string;
}) {
  if (!segments.length || segments.some(({ value }) => !Number.isFinite(value) || value < 0)) {
    return <p className="system-tile-empty">No complete breakdown for this day.</p>;
  }
  const total = segments.reduce((sum, { value }) => sum + value, 0);
  if (total === 0) {
    return <p className="system-tile-empty">Total 0 {unit} · No proportions to chart.</p>;
  }

  const stops = segments.flatMap(({ value }, index) => {
    if (value === 0) return [];
    const before = segments.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    return [colors[index] + " " + before / total * 360 + "deg " + (before + value) / total * 360 + "deg"];
  });
  const fill = stops.length === 1 ? colors[segments.findIndex(({ value }) => value > 0)] :
    "conic-gradient(" + stops.join(", ") + ")";

  return (
    <figure className="dashboard-donut">
      <div className="dashboard-donut-ring" style={{ background: fill }} aria-hidden="true" />
      <figcaption>
        <p>Total <strong>{number.format(total)} {unit}</strong></p>
        <ul>
          {segments.map(({ label, value }, index) => (
            <li key={label}>
              <span aria-hidden="true" className="dashboard-donut-swatch" style={{ background: colors[index] }} />
              <span>{label}</span>
              <strong>{number.format(value)} <span>({percentage.format(value / total)})</span></strong>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
