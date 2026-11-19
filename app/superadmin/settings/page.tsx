"use client";

import { useState } from "react";
import { initialManagementData, timeZones } from "@/data/management";
import type { ManagementSettings } from "@/data/management";
import { saveSettings, useManagement } from "@/utils/management-store";

export default function SettingsPage() {
  const { settings } = useManagement();
  const [draft, setDraft] = useState<Partial<ManagementSettings>>({});
  const [message, setMessage] = useState("");
  const values = { ...settings, ...draft };

  return (
    <main>
      <h1>Settings</h1>
      <p>Choose table spacing and the time zone for audit logs.</p>
      <section className="superadmin-card superadmin-settings">
        <h2>Display preferences</h2>
        <form
          className="superadmin-form"
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await saveSettings(values);
              setDraft({});
              setMessage("Preferences saved.");
            } catch (error) {
              setMessage(
                error instanceof Error
                  ? error.message
                  : "Could not save preferences.",
              );
            }
          }}
        >
          <label>
            Table density
            <select
              value={values.density}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  density: event.target.value as ManagementSettings["density"],
                })
              }
            >
              <option value="standard">Standard</option>
              <option value="compact">Compact</option>
            </select>
          </label>
          <label>
            Audit time zone
            <select
              value={values.timeZone}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  timeZone: event.target
                    .value as ManagementSettings["timeZone"],
                })
              }
            >
              {timeZones.map((zone) => (
                <option key={zone}>{zone}</option>
              ))}
            </select>
          </label>
          <div className="superadmin-actions">
            <button type="submit" className="superadmin-button">
              Save settings
            </button>
            <button
              type="button"
              className="superadmin-text-link"
              onClick={() => {
                setDraft(initialManagementData.settings);
                setMessage("");
              }}
            >
              Use defaults
            </button>
          </div>
          {message && <p role="status">{message}</p>}
        </form>
      </section>
    </main>
  );
}
