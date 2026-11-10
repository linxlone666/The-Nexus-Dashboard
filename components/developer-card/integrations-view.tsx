"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const integrations = [
  { name: "HQ · Demo Security", sources: "2 of 3 sources", status: "Degraded" },
  { name: "Sandbox", sources: "3 sources", status: "Healthy" },
] as const;

export default function IntegrationsView() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedName, setSelectedName] = useState<string>(
    integrations[0].name,
  );

  const visibleIntegrations = useMemo(
    () =>
      integrations.filter(
        (integration) =>
          integration.name.toLowerCase().includes(query.toLowerCase()) &&
          (statusFilter === "All statuses" ||
            integration.status === statusFilter),
      ),
    [query, statusFilter],
  );
  const selectedIntegration =
    integrations.find((integration) => integration.name === selectedName) ??
    integrations[0];

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <section className="min-h-[460px] rounded border border-[#d7e5e1] bg-white p-4 lg:col-span-7">
        <h2 className="mb-2 text-lg font-bold">My integrations</h2>
        <div className="mb-4 flex flex-wrap gap-2.5">
          <label className="min-w-52 flex-1">
            <span className="sr-only">Search integrations</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="h-10 w-full rounded border border-[#d7e5e1] px-3 text-sm placeholder:text-[#60777a] focus:border-[#078579] focus:outline-none focus:ring-2 focus:ring-[#078579]/15"
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 min-w-36 rounded border border-[#d7e5e1] bg-white px-3 text-sm text-[#60777a] focus:border-[#078579] focus:outline-none focus:ring-2 focus:ring-[#078579]/15"
            >
              <option>All statuses</option>
              <option>Healthy</option>
              <option>Degraded</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#eaf3f0] text-xs font-semibold">
              <tr>
                <th scope="col" className="px-3 py-2.5">
                  Connection
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Sources
                </th>
                <th scope="col" className="px-3 py-2.5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleIntegrations.map((integration) => {
                const isSelected = integration.name === selectedName;

                return (
                  <tr
                    key={integration.name}
                    aria-selected={isSelected}
                    className={`cursor-pointer border-b border-[#d7e5e1] ${
                      isSelected ? "bg-[#e3f1ed]" : "hover:bg-[#f5f9f7]"
                    }`}
                    onClick={() => setSelectedName(integration.name)}
                  >
                    <th scope="row" className="px-3 py-3 font-semibold">
                      {integration.name}
                    </th>
                    <td className="px-3 py-3">{integration.sources}</td>
                    <td className="px-3 py-3">{integration.status}</td>
                  </tr>
                );
              })}
              {visibleIntegrations.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-6 text-center text-[#60777a]"
                  >
                    No integrations match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex min-h-[460px] flex-col rounded border border-[#d7e5e1] bg-white p-5 lg:col-span-5">
        <h2 className="text-lg font-bold">Connection details</h2>
        <div className="mt-6">
          <h3 className="font-bold">{selectedIntegration.name}</h3>
          <p className="mt-2 text-sm text-[#60777a]">
            {selectedIntegration.sources} · {selectedIntegration.status}
          </p>
        </div>
        <hr className="my-5 border-[#d7e5e1]" />
        <div className="space-y-5 text-sm text-[#60777a]">
          <p>Environment: Production</p>
          <p>Last delivery: Failed · HTTP 422</p>
          <p>Only assigned integrations are visible.</p>
        </div>
        <Link
          href="/developer/test-deliveries"
          className="mt-auto inline-flex w-fit items-center rounded bg-[#078579] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#066f66] focus:outline-none focus:ring-2 focus:ring-[#078579]/40"
        >
          View test deliveries
        </Link>
      </section>
    </div>
  );
}
