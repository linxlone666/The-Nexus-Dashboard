"use client";

import { useState } from "react";
import { useManagement } from "@/utils/management-store";

export default function AuditLogsPage() {
  const { audit, settings } = useManagement();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const search = query.trim().toLowerCase();
  const visible = audit.filter(
    (entry) =>
      (category === "All" || entry.category === category) &&
      (entry.action + " " + entry.target).toLowerCase().includes(search),
  );
  const dateFormat = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: settings.timeZone,
  });

  return (
    <main>
      <h1>Audit Logs</h1>
      <p>
        Review recent changes to accounts, sites, and settings in this browser.
      </p>
      <section className="superadmin-card">
        <div className="superadmin-actions">
          <label className="superadmin-search">
            Search activity{" "}
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="superadmin-search">
            Category{" "}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {["All", "Users", "Sites", "Settings"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="superadmin-table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Time ({settings.timeZone})</th>
                <th scope="col">Category</th>
                <th scope="col">Action</th>
                <th scope="col">Target</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ id, date, category, action, target }) => (
                <tr key={id}>
                  <td>
                    <time dateTime={date}>
                      {dateFormat.format(new Date(date))}
                    </time>
                  </td>
                  <td>{category}</td>
                  <td>{action}</td>
                  <td>{target}</td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={4}>
                    {audit.length
                      ? "No matching events."
                      : "No changes have been recorded yet."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
