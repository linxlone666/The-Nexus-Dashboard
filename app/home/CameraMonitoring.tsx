"use client";

import { useState } from "react";
import { getCameraMonitoring } from "@/data/mock-monitoring-records";
import type { ManagedSite } from "@/data/management";
import { formatSystemDate } from "./SystemTile";

export function CameraMonitoring({ site }: { site: ManagedSite }) {
  const data = getCameraMonitoring(site);
  const [cameraId, setCameraId] = useState<string | null>(null);
  if (!data) return null;

  const selected = data.cameras.find(({ id }) => id === cameraId);
  const events = selected
    ? data.events.filter(({ cameraId }) => cameraId === selected.id)
    : data.events;

  return (
    <div className="camera-monitoring">
      <section
        className="monitoring-history"
        aria-labelledby="monitoring-cameras-heading"
      >
        <h2 id="monitoring-cameras-heading">Cameras</h2>
        <div className="monitoring-camera-grid">
          {data.cameras.map((camera) => (
            <button
              key={camera.id}
              type="button"
              className="monitoring-camera-card"
              aria-pressed={selected?.id === camera.id}
              onClick={() =>
                setCameraId((current) =>
                  current === camera.id ? null : camera.id,
                )
              }
            >
              <span
                className="monitoring-camera-preview"
                data-offline={camera.status === "Offline"}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                >
                  <use href="/nexus-navigation.svg#camera" />
                </svg>
                <span>
                  {camera.status === "Offline"
                    ? "Feed unavailable"
                    : "Demo camera preview"}
                </span>
              </span>
              <span className="monitoring-camera-caption">
                <span>
                  <strong>{camera.name}</strong>
                  <small>{camera.id}</small>
                </span>
                <span
                  className="monitoring-camera-status"
                  data-online={camera.status === "Online"}
                >
                  {camera.status}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section
        className="monitoring-history"
        aria-labelledby="monitoring-camera-events-heading"
      >
        <div className="monitoring-records-heading">
          <h2 id="monitoring-camera-events-heading">
            {selected ? selected.name + " events" : "Camera events"}
          </h2>
          {selected && (
            <button
              type="button"
              className="monitoring-site-link"
              onClick={() => setCameraId(null)}
            >
              Show all cameras
            </button>
          )}
        </div>
        <p className="monitoring-record-date">
          <time dateTime={data.date}>{formatSystemDate(data.date)}</time> ·
          Sample events
        </p>
        {events.length ? (
          <div className="monitoring-table-scroll">
            <table className="monitoring-records">
              <thead>
                <tr>
                  <th scope="col">Time</th>
                  <th scope="col">Camera</th>
                  <th scope="col">Event</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.time + event.cameraId}>
                    <td>{event.time}</td>
                    <td>
                      {
                        data.cameras.find(({ id }) => id === event.cameraId)
                          ?.name
                      }
                    </td>
                    <td>{event.name}</td>
                    <td>{event.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No sample events for this camera.</p>
        )}
      </section>
    </div>
  );
}
