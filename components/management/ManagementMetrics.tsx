import styles from "./management.module.css";

// Render a consistent set of labeled summary values for management screens.
export function ManagementMetrics({
  metrics,
}: {
  metrics: ReadonlyArray<
    readonly [label: string, value: number, description: string]
  >;
}) {
  return (
    <dl className={styles.metrics}>
      {metrics.map(([label, value, description]) => (
        <div className={styles.card} key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
          <dd className={styles.muted}>{description}</dd>
        </div>
      ))}
    </dl>
  );
}
