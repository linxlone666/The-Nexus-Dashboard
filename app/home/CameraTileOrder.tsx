import { getCameraMonitoring } from "@/data/mock-monitoring-records";
import type { ManagedSite } from "@/data/management";

export function CameraTileOrder({
  site,
  selected,
  onChange,
}: {
  site: ManagedSite;
  selected?: readonly string[];
  onChange: (ids: string[]) => void;
}) {
  const cameras = getCameraMonitoring(site)?.cameras ?? [];
  const ids = (selected ?? cameras.map((camera) => camera.id)).filter((id) =>
    cameras.some((camera) => camera.id === id),
  );
  const remaining = cameras.filter((camera) => !ids.includes(camera.id));

  function move(index: number, direction: number) {
    const next = [...ids];
    const target = index + direction;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <fieldset className="camera-tile-order">
      <legend>
        Cameras · {ids.length} of {cameras.length}
      </legend>
      {!ids.length && <p role="status">Choose at least one camera.</p>}
      <ol>
        {ids.map((id, index) => {
          const name = cameras.find((camera) => camera.id === id)?.name ?? id;
          return (
            <li key={id}>
              <span>{name}</span>
              <button
                type="button"
                aria-label={"Move " + name + " up"}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={"Move " + name + " down"}
                disabled={index === ids.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={"Remove " + name + " from tile"}
                onClick={() => onChange(ids.filter((item) => item !== id))}
              >
                ×
              </button>
            </li>
          );
        })}
      </ol>
      {remaining.length > 0 && (
        <label>
          Add camera
          <select
            value=""
            onChange={(event) => onChange([...ids, event.target.value])}
          >
            <option value="" disabled>
              Choose a camera
            </option>
            {remaining.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.name}
              </option>
            ))}
          </select>
        </label>
      )}
    </fieldset>
  );
}
