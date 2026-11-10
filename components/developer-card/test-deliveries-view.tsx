"use client";

import { useState } from "react";

const deliveryHistory = [
  { id: "evt_1048", time: "09:48", event: "motion_detected", attempt: "1 of 2", result: "Failed" },
  { id: "evt_1048-retry", time: "09:50", event: "motion_detected", attempt: "2 of 2", result: "Delivered" },
  { id: "evt_1047", time: "09:44", event: "device_online", attempt: "1 of 1", result: "Delivered" },
  { id: "evt_1046", time: "09:40", event: "heartbeat", attempt: "1 of 1", result: "Delivered" },
] as const;

export default function TestDeliveriesView() {
  const [selectedId, setSelectedId] = useState<string>(
    deliveryHistory[0].id,
  );
  const [notice, setNotice] = useState("");
  const selectedDelivery =
    deliveryHistory.find((delivery) => delivery.id === selectedId) ??
    deliveryHistory[0];

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <section className="min-h-[480px] rounded border border-[#d7e5e1] bg-white p-4">
        <h2 className="text-lg font-bold">Delivery history</h2>
        <p className="mb-4 text-sm text-[#60777a]">
          Demo Security · Headquarters · Sandbox
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead className="bg-[#eaf3f0] text-xs font-semibold">
              <tr>
                <th scope="col" className="px-2.5 py-2.5">
                  Time
                </th>
                <th scope="col" className="px-2.5 py-2.5">
                  Event
                </th>
                <th scope="col" className="px-2.5 py-2.5">
                  Attempt
                </th>
                <th scope="col" className="px-2.5 py-2.5">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveryHistory.map((delivery) => {
                const isSelected = delivery.id === selectedId;
                const isFailed = delivery.result === "Failed";

                return (
                  <tr
                    key={delivery.id}
                    aria-selected={isSelected}
                    className={`cursor-pointer border-b border-[#d7e5e1] ${
                      isSelected ? "bg-[#f0f7f4]" : "hover:bg-[#f5f9f7]"
                    }`}
                    onClick={() => {
                      setSelectedId(delivery.id);
                      setNotice("");
                    }}
                  >
                    <th scope="row" className="whitespace-nowrap px-2.5 py-3 font-semibold">
                      {delivery.time}
                    </th>
                    <td className="whitespace-nowrap px-2.5 py-3">
                      {delivery.event}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-3">
                      {delivery.attempt}
                    </td>
                    <td className="px-2.5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isFailed
                            ? "bg-[#fce9e5] text-[#b34437]"
                            : "bg-[#e2f2ed] text-[#167564]"
                        }`}
                      >
                        {delivery.result}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-sm text-[#60777a]">
          Selected delivery: {selectedDelivery.id} · Request ID: req_22a
        </p>
      </section>

      <section className="flex min-h-[480px] flex-col rounded border border-[#d7e5e1] bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Delivery detail</h2>
            <p className="mt-1 text-sm text-[#60777a]">
              POST /events · {selectedDelivery.time}:03 · Attempt{" "}
              {selectedDelivery.attempt.split(" of ")[0]}
            </p>
          </div>
          <span className="rounded-full bg-[#fce9e5] px-2.5 py-1 text-[11px] font-bold text-[#b34437]">
            HTTP 422
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-bold">Request payload</h3>
            <pre className="min-h-[118px] overflow-x-auto whitespace-pre-wrap rounded-md bg-[#102f33] p-3 text-xs leading-5 text-[#d3e2df]">
              {`{\nevent: "${selectedDelivery.event}",\ndevice: "loading-dock"\n}`}
            </pre>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Response</h3>
            <pre className="min-h-[118px] overflow-x-auto whitespace-pre-wrap rounded-md bg-[#102f33] p-3 text-xs leading-5 text-[#d3e2df]">
              {`{\ncode: "UNMAPPED_DEVICE",\nsource: "loading-dock"\n}`}
            </pre>
          </div>
        </div>

        <hr className="my-5 border-[#d7e5e1]" />
        <h3 className="mb-2 font-bold">Retry timeline</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-[#b34437]">
              09:48 · Attempt 1 failed
            </p>
            <p className="mt-1 text-[#60777a]">Device mapping was missing.</p>
          </div>
          <div>
            <p className="font-semibold text-[#078579]">
              09:50 · Attempt 2 delivered
            </p>
            <p className="mt-1 text-[#60777a]">
              Mapping corrected · HTTP 200 · 148 ms
            </p>
          </div>
        </div>
        {notice && (
          <p role="status" className="mt-3 text-sm text-[#60777a]">
            {notice}
          </p>
        )}
        <div className="mt-auto flex justify-end pt-5">
          <button
            type="button"
            onClick={() =>
              setNotice("Retry is a visual demo; no request was sent.")
            }
            className="rounded bg-[#078579] px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-[#066f66] focus:outline-none focus:ring-2 focus:ring-[#078579]/40"
          >
            Retry test event
          </button>
        </div>
      </section>
    </div>
  );
}
