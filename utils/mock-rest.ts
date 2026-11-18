import type { SystemId, WorkSiteId } from "@/data/mock-system-data";

export const mockRestScenarios = [
  { id: "success", label: "Valid readings (200)" },
  { id: "empty", label: "No readings (200)" },
  { id: "unavailable", label: "Provider unavailable (503)" },
  { id: "malformed", label: "Invalid response (200)" },
] as const;

export type MockRestScenario = (typeof mockRestScenarios)[number]["id"];

export async function checkMockRest(
  site: WorkSiteId,
  system: SystemId,
  scenario: MockRestScenario,
) {
  const query = new URLSearchParams({ site, system, scenario });
  const response = await fetch("/api/mock/monitoring?" + query, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok)
    throw new Error("Mock provider returned HTTP " + response.status + ".");

  const result = await response.json();
  const { data } = result ?? {};
  if (
    result?.source !== "mock" ||
    data?.siteId !== site ||
    data.id !== system ||
    !Array.isArray(data.metrics) ||
    !data.metrics.length ||
    !data.metrics.every(
      (metric: unknown) =>
        metric !== null &&
        typeof metric === "object" &&
        "key" in metric &&
        typeof metric.key === "string",
    ) ||
    !Array.isArray(data.rows) ||
    !data.rows.every(
      (row: { date?: unknown; values?: Record<string, unknown> } | null) =>
        typeof row?.date === "string" &&
        row.values &&
        data.metrics.every(({ key }: { key: string }) =>
          Number.isFinite(row.values?.[key]),
        ),
    )
  )
    throw new Error(
      "Mock provider response does not match the expected readings schema.",
    );

  return { rowCount: data.rows.length as number };
}
