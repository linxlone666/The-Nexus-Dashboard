"use client";

import Link from "next/link";
import { useState } from "react";
import { demoDates, latestDemoDate, formatDemoDate } from "@/data/demo-dates";
import { DemoCameraVideo } from "@/components/DemoCameraVideo";
import { canAccessSite } from "@/data/management";
import { getCameraMonitoring } from "@/data/mock-monitoring-records";
import { useDemoProfile } from "@/utils/demo-session";
import { useSelectedWorkSite } from "@/utils/selected-work-site";

function useCameraMonitoring(date?: string) {
  const profile = useDemoProfile();
  const site = useSelectedWorkSite();
  const allowed = site && profile && canAccessSite(site, profile) &&
    (profile.role === "Superadmin" || (profile.systemsBySite?.[site.id]?.includes("cctv") ?? true));
  return { allowed, monitoring: allowed ? getCameraMonitoring(site, date) : undefined };
}

export function MobileCctv({ cameraIndex }: { cameraIndex?: number }) {
  const [date, setDate] = useState<string>(latestDemoDate);
  const { allowed, monitoring } = useCameraMonitoring(date);
  const cameras = cameraIndex === undefined ? monitoring?.cameras : monitoring?.cameras.slice(cameraIndex, cameraIndex + 1);
  return (
    <>
      {cameraIndex === undefined && (
        <>
          <Link href="/home">Back to Dashboard</Link>
          <label className="monitoring-day-picker">
            Sample day
            <select aria-label="Sample day" value={date} onChange={(event) => setDate(event.target.value)}>
              {demoDates.map((day) => <option key={day} value={day}>{formatDemoDate(day)}</option>)}
            </select>
          </label>
          <p>End-of-day camera state · {formatDemoDate(date)}</p>
        </>
      )}
      {cameras?.length ? (
        <section className="cctv-list" aria-label="Simulated camera feeds">
          {cameras.map(({ id, name, status, footage }) => (
            <article className="camera-card" key={id}>
              {footage ? (
                <DemoCameraVideo name={name} footage={footage} className="mobile-camera-video" />
              ) : <p className="camera-caption">Feed unavailable</p>}
              <div className="camera-caption"><h3>{name}</h3><p>{status} · {formatDemoDate(date)}</p></div>
            </article>
          ))}
        </section>
      ) : <p>{allowed ? "No sample camera footage for this site." : "CCTV is unavailable for the selected site."}</p>}
    </>
  );
}
