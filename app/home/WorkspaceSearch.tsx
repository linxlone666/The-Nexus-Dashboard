import { Input } from "@/components/tailgrids/core/input";
import type { ManagedSite } from "@/data/management";
import {
  getCameraMonitoring,
  getMonitoringRecords,
} from "@/data/mock-monitoring-records";
import type { SystemId } from "@/data/mock-system-data";
import { useId, useState } from "react";

export function WorkspaceSearch({
  site,
  systems,
  onOpen,
}: {
  site?: ManagedSite;
  systems: readonly { id: SystemId; name: string }[];
  onOpen: (id: SystemId) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const term = query.trim().toLowerCase();
  const showing = open && Boolean(term);
  const matches = showing
    ? systems
        .flatMap(({ id, name }) => {
          const cameras =
            site && id === "cctv" ? getCameraMonitoring(site) : undefined;
          const records =
            site && id !== "cctv" ? getMonitoringRecords(site, id) : undefined;
          const labels = new Set([
            name,
            ...(cameras?.cameras.map((camera) => camera.name) ?? []),
            ...(cameras?.events.map((event) => event.name) ?? []),
            ...(records?.rows
              .map((row) => row[0])
              .filter((value) => typeof value === "string") ?? []),
          ]);
          return [...labels]
            .filter((label) => label.toLowerCase().includes(term))
            .map((label) => ({ id, label, category: name }));
        })
        .slice(0, 12)
    : [];
  const active = matches.length ? Math.min(highlight, matches.length - 1) : -1;

  function select(id: SystemId) {
    setOpen(false);
    setQuery("");
    onOpen(id);
  }

  return (
    <div className="workspace-search">
      <Input
        type="search"
        role="combobox"
        aria-label="Search devices and events"
        aria-autocomplete="list"
        aria-expanded={showing}
        aria-controls={showing ? listId : undefined}
        aria-activedescendant={active >= 0 ? listId + "-" + active : undefined}
        placeholder="Search devices and events"
        value={query}
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setHighlight(0);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            if (matches.length) {
              const step = event.key === "ArrowDown" ? 1 : -1;
              setHighlight((active + step + matches.length) % matches.length);
            }
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            select(matches[active].id);
          }
        }}
      />
      {showing && (
        <div className="workspace-search-results">
          <ul
            id={listId}
            role="listbox"
            aria-label="Search results"
            hidden={!matches.length}
          >
            {matches.map(({ id, label, category }, index) => (
              <li
                id={listId + "-" + index}
                role="option"
                aria-selected={index === active}
                key={id + label}
                onPointerDown={(event) => event.preventDefault()}
                onClick={() => select(id)}
              >
                <strong>{label}</strong>
                <small>{category}</small>
              </li>
            ))}
          </ul>
          {!matches.length && (
            <p role="status">No matching devices or events.</p>
          )}
        </div>
      )}
    </div>
  );
}
