
"use client";

import { useState } from "react";

export default function Operations() {

  // เลือกแท็บ
  const [tab, setTab] = useState("All events");

  // ข้อมูลการ์ด
  const stats = [
    ["Cameras online", "48 / 50", "96% uptime · 2 offline"],
    ["Active alarms", "03", "2 high priority · Across 2 zones"],
    ["People on site", "1,284", "↑ 12.8% vs. yesterday"],
    ["Parking availability", "64 spaces free", "32% available · 200 total spaces"]
  ];

  // ข้อมูลกล้อง
  const cameras = [
    ["Main lobby", "Building A · Ground floor"],
    ["Parking entrance", "Building A · Basement 1"]
  ];

  // ข้อมูลเหตุการณ์
  const events = [
    ["Restricted area intrusion", "Building A · Server room", "CCTV analytics", "2 min ago", "High"],
    ["Emergency exit door opened", "Building A · East wing, Floor 2", "Access control", "5 min ago", "High"],
    ["Smoke sensor requires review", "Building B · Storage area", "Smart alarm", "12 min ago", "Medium"],
    ["Camera connection lost", "Building A · Loading bay", "CCTV", "18 min ago", "Low"]
  ];

  // กรองเหตุการณ์
  let filteredEvents = [];

  if (tab === "All events") {
    filteredEvents = events;
  } else if (tab === "High priority") {
    filteredEvents = events.filter((event) => event[4] === "High");
  } else {
    filteredEvents = events.filter((event) => event[2] === "Smart alarm");
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 text-gray-700">

      {/* HEADER */}
      <header className="mb-6 flex justify-between">
        <div>
          <p className="text-xs text-gray-400">
            NEXUS / WIREFRAME / LATEST DEMO
          </p>

          <h1 className="text-2xl font-semibold">
            Operations overview
          </h1>

          <p className="text-xs text-gray-400">
            A clear picture of your spaces, systems, and safety.
          </p>

          <div className="mt-5 flex gap-6 text-xs">
            <span className="font-semibold">Control room [Live]</span>
            <span>Management</span>
            <span>+ New view</span>
            <span className="text-gray-400">● Live updates · Last synced just now</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="border bg-white px-4 py-2 text-xs">
            Oct 22, 2026
          </button>
          <button className="border bg-white px-4 py-2 text-xs">
            Customize
          </button>
          <button className="border bg-white px-4 py-2 text-xs">
            Build with AI
          </button>
        </div>
      </header>

      {/* SUMMARY CARDS */}
      <div className="mb-4 grid grid-cols-4 gap-4">
        {stats.map((item, index) => (
          <div key={index} className="border bg-white p-4">
            <p className="text-xs text-gray-400">{item[0]}</p>
            <h2 className="my-2 text-2xl font-semibold">{item[1]}</h2>
            <p className="text-xs text-gray-400">{item[2]}</p>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-3 gap-4">

        {/* LEFT SIDE */}
        <div className="col-span-2">

          {/* CAMERA */}
          <section className="mb-4 border bg-white p-4">
            <div className="mb-3 flex justify-between">
              <div>
                <h3 className="font-semibold">
                  Live camera views [48 online]
                </h3>
                <p className="text-xs text-gray-400">
                  Your pinned cameras, always in sight.
                </p>
              </div>

              <button className="text-xs">View all cameras ›</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {cameras.map((camera, index) => (
                <div key={index} className="flex h-36 flex-col justify-between border bg-gray-100 p-4">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>● LIVE</span>
                    <span>CAMERA FEED</span>
                  </div>

                  <div>
                    <p className="text-xs font-semibold">{camera[0]}</p>
                    <p className="mt-2 text-xs text-gray-400">{camera[1]}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ACCESS ACTIVITY */}
          <section className="border bg-white p-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">Access activity</h3>
                <p className="text-xs text-gray-400">
                  Entries across all access points
                </p>
              </div>
              <span className="text-xs">Today ⌄</span>
            </div>

            <div className="my-3 flex gap-5">
              <strong className="text-2xl">2,846</strong>
              <strong className="text-xl">↑ 8.2% vs. yesterday</strong>
            </div>

            {/* SIMPLE GRAPH */}
            <svg viewBox="0 0 900 100" className="h-24 w-full">
              <polyline
                points="0,80 100,70 200,65 300,35 400,50 500,20 600,45 700,25 800,40 900,20"
                fill="none"
                stroke="#666"
                strokeWidth="2"
              />

              <polyline
                points="0,85 100,78 200,70 300,50 400,60 500,40 600,65 700,50 800,55 900,45"
                fill="none"
                stroke="#bbb"
                strokeWidth="2"
                strokeDasharray="5 5"
              />
            </svg>

            <div className="flex justify-between text-xs text-gray-400">
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
            </div>

            <p className="mt-3 text-xs text-gray-400">
              ■ Today　 □ Previous period
            </p>
          </section>
        </div>

        {/* RIGHT SIDE */}
        <section className="border bg-white p-4">

          <h3 className="font-semibold">
            Needs your attention [4 new]
          </h3>

          <p className="mt-2 text-xs text-gray-400">
            Events that matter, across every system.
          </p>

          {/* TABS */}
          <div className="my-4 flex gap-2">
            <button
              onClick={() => setTab("All events")}
              className={`border px-3 py-2 text-xs ${tab === "All events" ? "bg-gray-200" : ""}`}
            >
              All events
            </button>

            <button
              onClick={() => setTab("High priority")}
              className={`border px-3 py-2 text-xs ${tab === "High priority" ? "bg-gray-200" : ""}`}
            >
              High priority
            </button>

            <button
              onClick={() => setTab("Alarms")}
              className={`border px-3 py-2 text-xs ${tab === "Alarms" ? "bg-gray-200" : ""}`}
            >
              Alarms
            </button>
          </div>

          {/* EVENT LIST */}
          {filteredEvents.map((event, index) => (
            <div key={index} className="border-b py-4">
              <h4 className="text-xs font-semibold">{event[0]}</h4>
              <p className="mt-2 text-xs text-gray-400">{event[1]}</p>

              <div className="mt-2 flex justify-between text-[10px] text-gray-400">
                <span>{event[2]}</span>
                <span>{event[3]} · {event[4]}</span>
              </div>
            </div>
          ))}

          <button className="mt-4 text-xs text-gray-400">
            Open activity center ↗
          </button>
        </section>
      </div>

      {/* CONNECTED SYSTEMS */}
      <footer className="mt-4 flex justify-between border bg-white p-4 text-xs">
        <strong>Connected systems</strong>
        <span>□ CCTV ●</span>
        <span>△ Smart alarm ●</span>
        <span>♙ Access control ●</span>
        <span>P Smart parking ●</span>
        <span>›</span>
      </footer>

    </div>
  );
}
