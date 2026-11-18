"use client";

import { useDemoProfile } from "@/utils/demo-session";
import { scopedAudit } from "@/utils/scoped-audit";
import { useState } from "react";
import { useManagement } from "@/utils/management-store";

export default function AuditLogsPage() {
  const { audit, settings } = useManagement();
  const profile = useDemoProfile();
  const events = scopedAudit(audit, profile);
  const [eventAction, setEventAction] = useState("");
  const eventActions = [...new Set(events.map((event) => event.action))].sort();
  const [actor, setActor] = useState("");
  const actors = [...new Set(events.flatMap((event) => [event.actorEmail, event.userEmail].filter((email): email is string => !!email)))].sort();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const search = query.trim().toLowerCase();
  const visible = events.filter(
    (entry) =>
      (!eventAction || entry.action === eventAction) &&
      (!actor || entry.actorEmail === actor || entry.userEmail === actor) &&
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
              aria-label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {["All", "Users", "Sites", "Settings"].map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="superadmin-search">
            Event
            <select
              aria-label="Event"
              value={eventAction}
              onChange={(event) => setEventAction(event.target.value)}
            >
              <option value="">All events</option>
              {eventActions.map((action) => <option key={action}>{action}</option>)}
            </select>
          </label>
          <label className="superadmin-search">
            User
            <select aria-label="User" value={actor} onChange={(event) => setActor(event.target.value)}>
              <option value="">All users</option>
              {actors.map((email) => <option key={email}>{email}</option>)}
            </select>
          </label>
          <button type="button" className="superadmin-secondary-button" onClick={() => {
            setQuery("");
            setCategory("All");
            setActor("");
            setEventAction("");
          }}>Clear filters</button>
        </div>
        <div className="superadmin-table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Time ({settings.timeZone})</th>
                <th scope="col">Category</th>
                <th scope="col">Action</th>
                <th scope="col">Target</th>
                <th scope="col">Performed by</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(({ id, date, category, action, target, actorEmail }) => (
                <tr key={id}>
                  <td>
                    <time dateTime={date}>
                      {dateFormat.format(new Date(date))}
                    </time>
                  </td>
                  <td>{category}</td>
                  <td>{action}</td>
                  <td>{target}</td>
                  <td>{actorEmail ?? "—"}</td>
                </tr>
              ))}
              {!visible.length && (
                <tr>
                  <td colSpan={5}>
                    {events.length
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
