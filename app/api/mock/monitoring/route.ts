import { getSiteDataset, systemCatalog } from "@/data/mock-system-data";
import { getWorkSite } from "@/data/work-sites";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const site = getWorkSite(params.get("site"));
  const system = systemCatalog.find(({ id }) => id === params.get("system"));
  const scenario = params.get("scenario") ?? "success";

  function respond(body: unknown, status = 200) {
    return Response.json(body, {
      status,
      headers: { "Cache-Control": "no-store" },
    });
  }

  if (!["success", "empty", "unavailable", "malformed"].includes(scenario)) {
    return respond(
      {
        error: { code: "INVALID_SCENARIO", message: "Unknown mock scenario." },
      },
      400,
    );
  }
  const dataset = site && system && getSiteDataset(site.id, system.id);
  if (!dataset) {
    return respond(
      {
        error: {
          code: "DATASET_NOT_FOUND",
          message: "Choose a known sample site and system.",
        },
      },
      404,
    );
  }
  if (scenario === "unavailable") {
    return respond(
      {
        error: {
          code: "MOCK_UNAVAILABLE",
          message: "Mock provider is unavailable.",
        },
      },
      503,
    );
  }
  if (scenario === "malformed")
    return respond({ source: "mock", data: { rows: "invalid" } });

  return respond({
    source: "mock",
    data: { ...dataset, rows: scenario === "empty" ? [] : dataset.rows },
  });
}
