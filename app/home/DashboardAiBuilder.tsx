import { useState } from "react";
import { addTile, tileName } from "./dashboard-layout";
import type { DashboardLayout, TileKind } from "./dashboard-layout";

const keywords: { kind: TileKind; match: RegExp }[] = [
  { kind: "cameras", match: /\bcameras?\b|\bcctv\b|กล้อง/i },
  {
    kind: "incidents",
    match: /\balarms?\b|\bincidents?\b|\balerts?\b|แจ้งเตือน|เหตุการณ์/i,
  },
  { kind: "access", match: /\baccess\b|\bentrance\b|เข้าออก|ประตู/i },
];

export function DashboardAiBuilder({
  layout,
  availableKinds,
  onApply,
  onClose,
}: {
  layout: DashboardLayout;
  availableKinds: readonly TileKind[];
  onApply: (layout: DashboardLayout) => void;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<TileKind[]>([]);
  const [message, setMessage] = useState("");

  function applySuggestions() {
    let next = layout;
    for (const kind of suggestions) {
      if (!availableKinds.includes(kind)) continue;
      const added = addTile(next, kind);
      if (!added) {
        setMessage(
          "Expand the grid to make room for the suggested tiles, then try again.",
        );
        return;
      }
      next = added;
    }
    onApply(next);
  }

  return (
    <section
      className="dashboard-tile-form dashboard-ai-builder"
      aria-label="Build with AI"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const matches = keywords
            .filter(
              ({ match, kind }) =>
                availableKinds.includes(kind) && match.test(prompt),
            )
            .map(({ kind }) => kind);
          setSuggestions(matches);
          setMessage(
            matches.length
              ? ""
              : "Try asking for cameras, alarms, or access activity.",
          );
        }}
      >
        <label>
          What should this dashboard show?
          <input
            required
            maxLength={240}
            placeholder="Show live cameras and priority alarms"
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              setSuggestions([]);
              setMessage("");
            }}
          />
        </label>
        <p className="overview-help-text">
          Demo suggestions use keywords and the available tiles.
        </p>
        <div className="overview-heading-actions">
          <button type="submit" className="overview-save-button">
            Preview tiles
          </button>
          <button
            type="button"
            className="overview-secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </form>
      {suggestions.length > 0 && (
        <div>
          <p className="overview-tile-title">Suggested tiles</p>
          <ul>
            {suggestions.map((kind) => (
              <li key={kind}>{tileName(kind)}</li>
            ))}
          </ul>
          <button
            type="button"
            className="overview-save-button"
            onClick={applySuggestions}
          >
            Add suggested tiles
          </button>
        </div>
      )}
      {message && (
        <p role="status" className="overview-dashboard-error">
          {message}
        </p>
      )}
    </section>
  );
}
