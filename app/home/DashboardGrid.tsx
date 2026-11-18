"use client";

import {
  resolveTileDisplay,
  tileDisplayNames,
  resolveTileSource,
  tileSources,
} from "./tile-displays";
import type { TileDisplay } from "./tile-displays";

import { CameraTileOrder } from "./CameraTileOrder";
import type { ManagedSite } from "@/data/management";
import { useEffect, useRef, useState } from "react";
import { DashboardAiBuilder } from "./DashboardAiBuilder";
import { Gear1, Plus, Trash1 } from "@tailgrids/icons";
import type { PointerEvent, ReactNode } from "react";
import {
  addTile,
  gridSizes,
  gridColumns,
  minimumSize,
  moveTile,
  removeTile,
  reorderTile,
  setFreePlacement,
  placeTiles,
  resizeGrid,
  resizeTile,
  tileIds,
  tileKind,
  tileName,
  tileOrder,
  tileTitle,
  tileSystem,
  updateTile,
} from "./dashboard-layout";
import type {
  DashboardLayout,
  ResizeEdge,
  TileId,
  TileKind,
  TilePosition,
  TileSize,
} from "./dashboard-layout";

type Drag = {
  tile: TileId;
  position: TilePosition;
  edge?: ResizeEdge;
  offsetX: number;
  offsetY: number;
  columnStep: number;
  rowStep: number;
};

const resizeEdges = [
  { name: "top", x: 0, y: -1 },
  { name: "right", x: 1, y: 0 },
  { name: "bottom", x: 0, y: 1 },
  { name: "left", x: -1, y: 0 },
  { name: "top-left", x: -1, y: -1 },
  { name: "top-right", x: 1, y: -1 },
  { name: "bottom-left", x: -1, y: 1 },
  { name: "bottom-right", x: 1, y: 1 },
] as const;
const arrowOffsets: Record<string, TilePosition> = {
  ArrowLeft: { column: -1, row: 0 },
  ArrowRight: { column: 1, row: 0 },
  ArrowUp: { column: 0, row: -1 },
  ArrowDown: { column: 0, row: 1 },
};

export function DashboardGrid({
  layout,
  editing,
  onChange,
  renderTile,
  availableKinds = tileIds,
  mobile = false,
  site,
}: {
  layout: DashboardLayout;
  mobile?: boolean;
  site?: ManagedSite;
  availableKinds?: readonly TileKind[];
  editing: boolean;
  onChange: (layout: DashboardLayout) => void;
  renderTile: (
    kind: TileKind,
    title: string,
    display?: TileDisplay,
    preview?: boolean,
    dataKey?: string,
    cameraIds?: readonly string[],
  ) => ReactNode;
}) {
  const grid = useRef<HTMLDivElement>(null);
  const settingsDialog = useRef<HTMLDialogElement>(null);
  const [removedLayout, setRemovedLayout] = useState<DashboardLayout | null>(
    null,
  );
  const previewFrame = useRef<HTMLDivElement>(null);
  const [previewWidths, setPreviewWidths] = useState({ grid: 0, frame: 0 });
  const drag = useRef<Drag | null>(null);
  const [preview, setPreview] = useState<{
    tile: TileId;
    layout: DashboardLayout;
  } | null>(null);
  const [adding, setAdding] = useState(false);
  const [buildingWithAi, setBuildingWithAi] = useState(false);
  const [kindToAdd, setKindToAdd] = useState<TileKind>(
    availableKinds[0] ?? "cameras",
  );
  const [displayToAdd, setDisplayToAdd] = useState<TileDisplay>();
  const [addDataKey, setAddDataKey] = useState<string>();
  const [addCameraIds, setAddCameraIds] = useState<readonly string[]>();
  const addSources = tileSources(site, tileSystem(kindToAdd));
  const addSource = resolveTileSource(addSources, addDataKey);
  const selectedAddCameras =
    addSource.key === "cameras" ? addCameraIds : undefined;
  const addDisplay = resolveTileDisplay(addSource, displayToAdd);
  const rowOptions = layout.rows > 8 ? [...gridSizes, layout.rows] : gridSizes;
  const [settings, setSettings] = useState<
    | (TileSize & {
        id: TileId;
        title: string;
        display?: TileDisplay;
        kind: TileKind;
        dataKey?: string;
        cameraIds?: readonly string[];
      })
    | null
  >(null);
  const settingsSources = settings
    ? tileSources(site, tileSystem(settings.kind))
    : [];
  const settingsSource = settings
    ? resolveTileSource(settingsSources, settings.dataKey, settings.display)
    : undefined;
  const settingsDisplay =
    settingsSource && resolveTileDisplay(settingsSource, settings?.display);
  const selectedSettingsCameras =
    settingsSource?.key === "cameras" ? settings?.cameraIds : undefined;
  const showSettings = Boolean(editing && settings);
  useEffect(() => {
    const canvas = grid.current;
    const frame = previewFrame.current;
    const dialog = settingsDialog.current;
    if (!showSettings || !canvas || !frame || !dialog) return;
    if (!dialog.open) dialog.showModal();
    dialog.querySelector("input")?.focus();
    function measure() {
      if (canvas && frame)
        setPreviewWidths({
          grid: canvas.clientWidth,
          frame: frame.clientWidth,
        });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [showSettings]);
  const previewWidth = settings
    ? Math.max(
        1,
        ((previewWidths.grid + 12) / layout.columns) * settings.columns - 12,
      )
    : 1;
  const previewScale = previewWidths.frame
    ? Math.min(1, previewWidths.frame / previewWidth)
    : 1;
  const free = Boolean(layout.freePositions);
  const [message, setMessage] = useState("");
  const positions = placeTiles(layout);
  const previewPosition = preview && placeTiles(preview.layout)?.[preview.tile];
  const previewSize = preview?.layout.tiles[preview.tile];

  function closeSettings() {
    settingsDialog.current?.close();
    setSettings(null);
    setMessage("");
  }

  function changeGrid(size: TileSize) {
    if (mobile) return;
    const next = resizeGrid(layout, size);
    if (next) {
      applyLayout(next);
    } else {
      setMessage(
        free
          ? "Move or resize tiles before making the grid smaller."
          : "This grid is too small for the minimum tile sizes.",
      );
    }
  }

  function startDrag(
    event: PointerEvent<HTMLButtonElement>,
    tile: TileId,
    edge?: ResizeEdge,
  ) {
    const element = grid.current;
    const position = positions?.[tile];
    if (
      !editing ||
      mobile ||
      event.button !== 0 ||
      !event.isPrimary ||
      !element ||
      !position
    )
      return;
    const rect = element.getBoundingClientRect();
    const styles = getComputedStyle(element);
    drag.current = {
      tile,
      position,
      edge,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      columnStep:
        (element.clientWidth + parseFloat(styles.columnGap)) / layout.columns,
      rowStep: (element.clientHeight + parseFloat(styles.rowGap)) / layout.rows,
    };
    setMessage("");
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function draftFromPointer(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    const rect = grid.current?.getBoundingClientRect();
    if (
      !start ||
      !rect ||
      !event.currentTarget.hasPointerCapture(event.pointerId)
    )
      return;

    const offset = {
      column: Math.round(
        (event.clientX - rect.left - start.offsetX) / start.columnStep,
      ),
      row: Math.round(
        (event.clientY - rect.top - start.offsetY) / start.rowStep,
      ),
    };
    if (!offset.column && !offset.row) return;

    const next = start.edge
      ? resizeTile(layout, start.tile, start.edge, offset)
      : moveTile(layout, start.tile, {
          column: start.position.column + offset.column,
          row: start.position.row + offset.row,
        });
    return { tile: start.tile, layout: next };
  }

  function clearDrag() {
    drag.current = null;
    setPreview(null);
  }

  function applyLayout(next: DashboardLayout | null) {
    if (mobile) return;
    if (next) {
      onChange(next);
      setMessage("");
    } else {
      setMessage("That position or size does not fit here.");
    }
  }

  const pointerHandlers = {
    onPointerMove(event: PointerEvent<HTMLButtonElement>) {
      const draft = draftFromPointer(event);
      setPreview(
        draft?.layout ? { tile: draft.tile, layout: draft.layout } : null,
      );
    },
    onPointerUp(event: PointerEvent<HTMLButtonElement>) {
      const draft = draftFromPointer(event);
      clearDrag();
      if (draft) applyLayout(draft.layout);
    },
    onPointerCancel: clearDrag,
    onLostPointerCapture: clearDrag,
  };

  return (
    <div className="dashboard-grid-editor">
      {editing && (
        <div className="dashboard-grid-controls">
          <div className="dashboard-editor-actions">
            <button
              type="button"
              className="dashboard-tile-add"
              aria-expanded={adding}
              disabled={!availableKinds.length}
              onClick={() => {
                closeSettings();
                setBuildingWithAi(false);
                setAdding(!adding);
              }}
            >
              <Plus size={16} aria-hidden="true" /> Add tile
            </button>
            <button
              type="button"
              className="dashboard-editor-secondary"
              aria-expanded={buildingWithAi}
              disabled={!availableKinds.length}
              onClick={() => {
                closeSettings();
                setAdding(false);
                setBuildingWithAi(!buildingWithAi);
              }}
            >
              Build with AI
            </button>
          </div>
          <div className="dashboard-grid-options" aria-label="Grid layout">
            <label>
              Rows
              <select
                value={layout.rows}
                onChange={(event) =>
                  changeGrid({
                    rows: Number(event.target.value),
                    columns: layout.columns,
                  })
                }
              >
                {rowOptions.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </label>
            <label>
              Columns
              <select
                value={layout.columns}
                onChange={(event) =>
                  changeGrid({
                    rows: layout.rows,
                    columns: Number(event.target.value),
                  })
                }
              >
                {gridColumns.map((size) => (
                  <option key={size}>{size}</option>
                ))}
              </select>
            </label>
            <label>
              Placement
              <select
                value={free ? "free" : "auto"}
                onChange={(event) => {
                  applyLayout(
                    setFreePlacement(layout, event.target.value === "free"),
                  );
                }}
              >
                <option value="auto">Auto fill</option>
                <option value="free">Free placement</option>
              </select>
            </label>
          </div>
          <p className="dashboard-edit-hint">
            Drag a tile to move it. Drag an edge or the corner handle to resize.
          </p>
          {(message || removedLayout) && (
            <div className="dashboard-editor-feedback">
              <p role="status">{message}</p>
              {removedLayout && (
                <button
                  type="button"
                  className="dashboard-editor-secondary"
                  onClick={() => applyLayout(removedLayout)}
                >
                  Undo removal
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {editing && buildingWithAi && (
        <DashboardAiBuilder
          layout={layout}
          availableKinds={availableKinds}
          onClose={() => setBuildingWithAi(false)}
          onApply={(next) => {
            applyLayout(next);
            setBuildingWithAi(false);
          }}
        />
      )}
      {editing && adding && availableKinds.length > 0 && (
        <form
          className="dashboard-tile-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (
              !availableKinds.includes(kindToAdd) ||
              selectedAddCameras?.length === 0
            )
              return;
            let next = addTile(
              layout,
              kindToAdd,
              addDisplay,
              addSource.key,
              selectedAddCameras,
            );
            for (let rows = layout.rows + 1; !next && rows <= 8; rows++) {
              const expanded = resizeGrid(layout, {
                columns: layout.columns,
                rows,
              });
              if (expanded)
                next = addTile(
                  expanded,
                  kindToAdd,
                  addDisplay,
                  addSource.key,
                  selectedAddCameras,
                );
            }
            if (!next) {
              setMessage(
                "No room for this tile. Expand the grid or remove a tile.",
              );
              return;
            }
            applyLayout(next);
            if (next.rows > layout.rows)
              setMessage("Tile added. The grid grew to fit it.");
            setAdding(false);
          }}
        >
          <label>
            Tile type
            <select
              value={kindToAdd}
              onChange={(event) => {
                setKindToAdd(event.target.value as TileKind);
                setDisplayToAdd(undefined);
                setAddDataKey(undefined);
                setAddCameraIds(undefined);
              }}
            >
              {availableKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {tileName(kind)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Data source
            <select
              value={addSource.key}
              onChange={(event) => {
                setAddDataKey(event.target.value);
                setDisplayToAdd(undefined);
              }}
            >
              {addSources.map((source) => (
                <option key={source.key} value={source.key}>
                  {source.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Display
            <select
              value={addDisplay}
              onChange={(event) =>
                setDisplayToAdd(event.target.value as TileDisplay)
              }
            >
              {addSource.displays.map((display) => (
                <option key={display} value={display}>
                  {tileDisplayNames[display]}
                </option>
              ))}
            </select>
          </label>
          {addSource.key === "cameras" && site && (
            <CameraTileOrder
              site={site}
              selected={addCameraIds}
              onChange={setAddCameraIds}
            />
          )}
          <button
            type="submit"
            className="overview-save-button"
            disabled={selectedAddCameras?.length === 0}
          >
            Add
          </button>
          <button
            type="button"
            className="overview-secondary-button"
            onClick={() => {
              setAdding(false);
              setMessage("");
            }}
          >
            Cancel
          </button>
          <section className="dashboard-tile-preview" aria-label="Tile preview">
            <h3>Preview</h3>
            <div className="dashboard-grid-tile-content">
              {renderTile(
                kindToAdd,
                tileName(kindToAdd),
                addDisplay,
                true,
                addSource.key,
                selectedAddCameras,
              )}
            </div>
          </section>
        </form>
      )}
      {editing &&
        settings &&
        settingsSource &&
        settingsDisplay &&
        layout.tiles[settings.id] && (
          <dialog
            ref={settingsDialog}
            className="dashboard-tile-dialog"
            aria-labelledby="dashboard-tile-dialog-title"
            onCancel={(event) => {
              event.preventDefault();
              closeSettings();
            }}
          >
            <header className="dashboard-tile-dialog-header">
              <h2 id="dashboard-tile-dialog-title">Edit tile</h2>
              <p>{tileTitle(layout, settings.id)}</p>
            </header>
            <form
              className="dashboard-tile-settings"
              aria-label="Tile settings"
              onSubmit={(event) => {
                event.preventDefault();
                if (selectedSettingsCameras?.length === 0) return;
                const title = settings.title.trim();
                if (!title) {
                  setMessage("Enter a tile title.");
                  return;
                }
                const next = updateTile(
                  layout,
                  settings.id,
                  title,
                  settings,
                  settingsDisplay,
                  settings.kind,
                  settingsSource.key,
                  selectedSettingsCameras,
                );
                applyLayout(next);
                if (next) closeSettings();
              }}
            >
              <div className="dashboard-tile-settings-controls">
                <fieldset>
                  <legend>Data</legend>
                  <label>
                    Tile title
                    <input
                      required
                      maxLength={60}
                      value={settings.title}
                      onChange={(event) =>
                        setSettings({ ...settings, title: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    System
                    <select
                      value={settings.kind}
                      onChange={(event) => {
                        const kind = event.target.value as TileKind;
                        const source = resolveTileSource(
                          tileSources(site, tileSystem(kind)),
                          undefined,
                          settingsDisplay,
                        );
                        const size = minimumSize(kind, layout.columns);
                        setSettings({
                          ...settings,
                          kind,
                          cameraIds: undefined,
                          title:
                            settings.title === tileName(settings.kind)
                              ? tileName(kind)
                              : settings.title,
                          dataKey: source.key,
                          display: resolveTileDisplay(source, settingsDisplay),
                          rows: Math.max(settings.rows, size.rows),
                          columns: Math.max(settings.columns, size.columns),
                        });
                      }}
                    >
                      {availableKinds.map((kind) => (
                        <option value={kind} key={kind}>
                          {tileName(kind)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Data source
                    <select
                      value={settingsSource.key}
                      onChange={(event) => {
                        const source = resolveTileSource(
                          settingsSources,
                          event.target.value,
                        );
                        setSettings({
                          ...settings,
                          dataKey: source.key,
                          display: resolveTileDisplay(source, settingsDisplay),
                        });
                      }}
                    >
                      {settingsSources.map((source) => (
                        <option value={source.key} key={source.key}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </fieldset>
                {settingsSource.key === "cameras" && site && (
                  <CameraTileOrder
                    site={site}
                    selected={settings.cameraIds}
                    onChange={(cameraIds) =>
                      setSettings({ ...settings, cameraIds })
                    }
                  />
                )}
                <fieldset>
                  <legend>Display</legend>
                  <label>
                    Format
                    <select
                      value={settingsDisplay}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          display: event.target.value as TileDisplay,
                        })
                      }
                    >
                      {settingsSource.displays.map((display) => (
                        <option value={display} key={display}>
                          {tileDisplayNames[display]}
                        </option>
                      ))}
                    </select>
                  </label>
                </fieldset>
                <fieldset>
                  <legend>Size</legend>
                  <label>
                    Tile rows
                    <select
                      value={settings.rows}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          rows: Number(event.target.value),
                        })
                      }
                    >
                      {Array.from(
                        { length: layout.rows },
                        (_, index) => index + 1,
                      )
                        .filter(
                          (size) =>
                            size >=
                              minimumSize(settings.kind, layout.columns).rows &&
                            size <= layout.rows,
                        )
                        .map((size) => (
                          <option key={size}>{size}</option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Tile columns
                    <select
                      value={settings.columns}
                      onChange={(event) =>
                        setSettings({
                          ...settings,
                          columns: Number(event.target.value),
                        })
                      }
                    >
                      {gridColumns
                        .filter(
                          (size) =>
                            size >=
                              minimumSize(settings.kind, layout.columns)
                                .columns && size <= layout.columns,
                        )
                        .map((size) => (
                          <option key={size}>{size}</option>
                        ))}
                    </select>
                  </label>
                </fieldset>
                {message && (
                  <p className="dashboard-editor-error" role="alert">
                    {message}
                  </p>
                )}
                <div className="overview-heading-actions">
                  <button
                    type="submit"
                    className="overview-save-button"
                    disabled={selectedSettingsCameras?.length === 0}
                  >
                    Apply settings
                  </button>
                  <button
                    type="button"
                    className="overview-secondary-button"
                    onClick={closeSettings}
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div
                ref={previewFrame}
                className="dashboard-settings-preview"
                aria-label="Live tile preview"
              >
                <h3>
                  Live preview · {settings.columns} × {settings.rows}
                </h3>
                <div
                  className="dashboard-grid-tile-content"
                  style={{
                    width: previewWidth,
                    zoom: previewScale,
                    height: settings.rows * 176 + (settings.rows - 1) * 12,
                  }}
                >
                  {renderTile(
                    settings.kind,
                    settings.title || tileName(settings.kind),
                    settingsDisplay,
                    true,
                    settingsSource.key,
                    selectedSettingsCameras,
                  )}
                </div>
              </div>
            </form>
          </dialog>
        )}
      {positions && (
        <div className="dashboard-grid-scroll">
          <div
            ref={grid}
            className="dashboard-grid"
            data-editing={editing}
            data-mobile={mobile}
            style={{
              gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${layout.rows}, 176px)`,
              backgroundSize: editing
                ? `calc((100% + 12px) / ${layout.columns}) 188px`
                : undefined,
            }}
          >
            {tileOrder(layout).length === 0 && (
              <p className="dashboard-grid-empty">
                {editing
                  ? "Use Add tile or Build with AI to start."
                  : "This dashboard has no tiles yet."}
              </p>
            )}
            {editing && previewPosition && previewSize && (
              <div
                className="dashboard-grid-drop-target"
                aria-hidden="true"
                style={{
                  gridColumn:
                    previewPosition.column + " / span " + previewSize.columns,
                  gridRow: previewPosition.row + " / span " + previewSize.rows,
                }}
              />
            )}
            {tileOrder(layout).map((tile) => {
              const size = layout.tiles[tile];
              const kind = tileKind(layout, tile);
              const title = tileTitle(layout, tile);
              const position = positions[tile];
              return (
                <section
                  key={tile}
                  className="dashboard-grid-tile"
                  style={{
                    gridColumn: `${position.column} / span ${size.columns}`,
                    gridRow: `${position.row} / span ${size.rows}`,
                  }}
                  aria-label={title}
                  data-dragging={preview?.tile === tile}
                >
                  <div className="dashboard-grid-tile-content" inert={editing}>
                    {renderTile(
                      kind,
                      title,
                      size.display,
                      false,
                      size.dataKey,
                      size.cameraIds,
                    )}
                  </div>
                  {editing && (
                    <>
                      <button
                        type="button"
                        className="dashboard-tile-move"
                        aria-label={"Move " + title + ". Use arrow keys."}
                        onPointerDown={(event) => startDrag(event, tile)}
                        {...pointerHandlers}
                        onKeyDown={(event) => {
                          const offset = arrowOffsets[event.key];
                          if (!offset) return;
                          event.preventDefault();
                          applyLayout(
                            free
                              ? moveTile(layout, tile, {
                                  column: position.column + offset.column,
                                  row: position.row + offset.row,
                                })
                              : reorderTile(
                                  layout,
                                  tile,
                                  offset.column || offset.row,
                                ),
                          );
                        }}
                      >
                        <span
                          className="dashboard-move-grip"
                          aria-hidden="true"
                        >
                          ⠿
                        </span>
                      </button>
                      <div className="dashboard-tile-actions">
                        <button
                          type="button"
                          aria-label={"Settings for " + title}
                          title="Tile settings"
                          onClick={() => {
                            setAdding(false);
                            setBuildingWithAi(false);
                            setSettings({
                              id: tile,
                              title,
                              rows: size.rows,
                              columns: size.columns,
                              display: size.display,
                              kind,
                              dataKey: size.dataKey,
                              cameraIds: size.cameraIds,
                            });
                            setMessage("");
                          }}
                        >
                          <Gear1 size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={"Remove " + title}
                          title="Remove tile"
                          onClick={() => {
                            if (settings?.id === tile) closeSettings();
                            applyLayout(removeTile(layout, tile));
                            setRemovedLayout(layout);
                            setMessage(title + " removed.");
                          }}
                        >
                          <Trash1 size={16} aria-hidden="true" />
                        </button>
                      </div>
                      <span className="dashboard-tile-size" aria-hidden="true">
                        {size.columns} × {size.rows}
                      </span>
                      {resizeEdges.map((edge) => (
                        <button
                          key={edge.name}
                          type="button"
                          className="dashboard-tile-edge"
                          data-edge={edge.name}
                          tabIndex={edge.name === "bottom-right" ? 0 : -1}
                          aria-label={
                            "Resize " +
                            title +
                            " from " +
                            edge.name +
                            ". Use arrow keys."
                          }
                          onPointerDown={(event) =>
                            startDrag(event, tile, edge)
                          }
                          {...pointerHandlers}
                          onKeyDown={(event) => {
                            const offset = arrowOffsets[event.key];
                            if (!offset) return;
                            event.preventDefault();
                            applyLayout(resizeTile(layout, tile, edge, offset));
                          }}
                        >
                          {edge.name === "bottom-right" && (
                            <span aria-hidden="true" />
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
