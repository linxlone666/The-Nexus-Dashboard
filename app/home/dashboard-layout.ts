import type { TileDisplay } from "./tile-displays";
import { systemCatalog } from "@/data/mock-system-data";
import type { SystemId } from "@/data/mock-system-data";

const existingTileSystems = {
  cameras: "cctv",
  incidents: "alarms",
  access: "access",
} as const;
type ExistingTileKind = keyof typeof existingTileSystems;
type AdditionalTileKind = Exclude<SystemId, "cctv" | "alarms" | "access">;
export type TileKind = ExistingTileKind | AdditionalTileKind;

const additionalTileIds = systemCatalog
  .map(({ id }) => id)
  .filter(
    (id): id is AdditionalTileKind =>
      id !== "cctv" && id !== "alarms" && id !== "access",
  );
export const tileIds = [
  "cameras",
  "incidents",
  "access",
  ...additionalTileIds,
] as const;

export function tileSystem(kind: TileKind): SystemId {
  if (kind === "cameras" || kind === "incidents")
    return existingTileSystems[kind];
  return kind;
}
export type TileId = string;
export type TileSize = { columns: number; rows: number };
type DashboardTile = TileSize & {
  kind?: TileKind;
  title?: string;
  display?: TileDisplay;
  dataKey?: string;
  cameraIds?: readonly string[];
};
export type TilePosition = { column: number; row: number };
type TilePositions = Record<TileId, TilePosition>;

export type DashboardLayout = TileSize & {
  tiles: Record<TileId, DashboardTile>;
  order?: TileId[];
  freePositions?: TilePositions;
};

const existingTileNames = {
  cameras: "Live cameras",
  incidents: "Priority incidents",
  access: "Access activity",
};

export function tileName(kind: TileKind) {
  if (kind === "cameras" || kind === "incidents" || kind === "access") {
    return existingTileNames[kind];
  }
  return systemCatalog.find(({ id }) => id === kind)?.name ?? kind;
}

export const defaultLayout: DashboardLayout = {
  rows: 2,
  columns: 4,
  tiles: {
    cameras: { rows: 2, columns: 2 },
    incidents: { rows: 1, columns: 2 },
    access: { rows: 1, columns: 2 },
  },
};

export const emptyLayout: DashboardLayout = { rows: 2, columns: 4, tiles: {} };

export const gridColumns = [1, 2, 3, 4];
export const gridSizes = [1, 2, 3, 4, 5, 6, 7, 8];

export function minimumSize(tile: TileKind, columns: number): TileSize {
  if (tile !== "cameras") return { columns: 1, rows: 1 };
  return columns > 1 ? { columns: 2, rows: 1 } : { columns: 1, rows: 2 };
}

// Find a position for each tile without letting tiles overlap.
export function placeTiles(layout: DashboardLayout) {
  if (layout.freePositions) {
    return fitsFreePositions(layout, layout.freePositions)
      ? layout.freePositions
      : null;
  }

  const order = tileOrder(layout);
  const neededCells = order.reduce((sum, tile) => {
    const size = layout.tiles[tile];
    return sum + size.columns * size.rows;
  }, 0);
  if (neededCells > layout.rows * layout.columns) return null;

  // Bound the search when many tiles compete for the same space.
  let remainingAttempts = 8000;
  const positions: Partial<TilePositions> = {};
  const occupied = new Set<number>();

  function place(index: number): boolean {
    const tile = order[index];
    if (!tile) return true;

    const { columns, rows } = layout.tiles[tile];
    for (let row = 0; row + rows <= layout.rows; row++) {
      for (let column = 0; column + columns <= layout.columns; column++) {
        if (--remainingAttempts <= 0) return false;
        const cells: number[] = [];
        for (let y = row; y < row + rows; y++) {
          for (let x = column; x < column + columns; x++) {
            cells.push(y * layout.columns + x);
          }
        }

        if (cells.some((cell) => occupied.has(cell))) continue;
        cells.forEach((cell) => occupied.add(cell));
        positions[tile] = { column: column + 1, row: row + 1 };
        if (place(index + 1)) return true;
        cells.forEach((cell) => occupied.delete(cell));
        delete positions[tile];
      }
    }
    return false;
  }

  return place(0) ? (positions as TilePositions) : null;
}

export function resizeGrid(layout: DashboardLayout, size: TileSize) {
  if (!gridColumns.includes(size.columns)) return null;
  const next = { ...layout, ...size, tiles: { ...layout.tiles } };
  if (layout.freePositions) return placeTiles(next) ? next : null;

  const smallest = { ...next, tiles: { ...layout.tiles } };

  for (const tile of tileOrder(layout)) {
    const minimum = minimumSize(tileKind(layout, tile), size.columns);
    next.tiles[tile] = {
      ...layout.tiles[tile],
      columns: Math.max(
        minimum.columns,
        Math.min(size.columns, layout.tiles[tile].columns),
      ),
      rows: Math.max(
        minimum.rows,
        Math.min(size.rows, layout.tiles[tile].rows),
      ),
    };
    smallest.tiles[tile] = { ...layout.tiles[tile], ...minimum };
  }

  if (placeTiles(next)) return next;
  return placeTiles(smallest) ? smallest : null;
}

function fitsFreePositions(layout: DashboardLayout, positions: TilePositions) {
  const occupied = new Set<number>();
  for (const tile of tileOrder(layout)) {
    const position = positions[tile];
    if (!position) return false;
    const { column, row } = position;
    const size = layout.tiles[tile];
    const minimum = minimumSize(tileKind(layout, tile), layout.columns);
    if (
      column < 1 ||
      row < 1 ||
      column + size.columns - 1 > layout.columns ||
      row + size.rows - 1 > layout.rows ||
      size.columns < minimum.columns ||
      size.rows < minimum.rows
    ) {
      return false;
    }

    for (let y = row; y < row + size.rows; y++) {
      for (let x = column; x < column + size.columns; x++) {
        const cell = (y - 1) * layout.columns + x;
        if (occupied.has(cell)) return false;
        occupied.add(cell);
      }
    }
  }
  return true;
}

export function setFreePlacement(layout: DashboardLayout, enabled: boolean) {
  if (enabled) {
    const positions = placeTiles(layout);
    return positions ? { ...layout, freePositions: positions } : layout;
  }

  const { freePositions, ...autoLayout } = layout;
  if (!freePositions) return autoLayout;

  const order = [...tileOrder(layout)].sort((a, b) => {
    const first = freePositions[a];
    const second = freePositions[b];
    return first.row - second.row || first.column - second.column;
  });
  return { ...autoLayout, order };
}

export function moveTile(
  layout: DashboardLayout,
  tile: TileId,
  target: TilePosition,
) {
  if (
    target.row < 1 ||
    target.column < 1 ||
    target.row > layout.rows ||
    target.column > layout.columns
  ) {
    return null;
  }

  if (layout.freePositions) {
    const next = {
      ...layout,
      freePositions: { ...layout.freePositions, [tile]: target },
    };
    return placeTiles(next) ? next : null;
  }

  const positions = placeTiles(layout);
  if (!positions) return null;

  const order = [...tileOrder(layout)];
  const from = order.indexOf(tile);
  // A drop on another tile moves this tile into that tile's order slot.
  const hit = order.find((item) => {
    const position = positions[item];
    const size = layout.tiles[item];
    return (
      target.row >= position.row &&
      target.row < position.row + size.rows &&
      target.column >= position.column &&
      target.column < position.column + size.columns
    );
  });
  if (hit === tile) return layout;

  order.splice(from, 1);
  const before = order.findIndex((item) => {
    const position = positions[item];
    return (
      position.row > target.row ||
      (position.row === target.row && position.column > target.column)
    );
  });
  const to = hit
    ? tileOrder(layout).indexOf(hit)
    : before < 0
      ? order.length
      : before;
  order.splice(to, 0, tile);
  return { ...layout, order };
}

export function reorderTile(
  layout: DashboardLayout,
  tile: TileId,
  direction: number,
) {
  const order = [...tileOrder(layout)];
  const from = order.indexOf(tile);
  const to = from + direction;
  if (to < 0 || to >= order.length) return layout;
  order.splice(from, 1);
  order.splice(to, 0, tile);
  return { ...layout, order };
}

export type ResizeEdge = { x: -1 | 0 | 1; y: -1 | 0 | 1 };

export function resizeTile(
  layout: DashboardLayout,
  tile: TileId,
  edge: ResizeEdge,
  offset: TilePosition,
) {
  const size = layout.tiles[tile];
  const min = minimumSize(tileKind(layout, tile), layout.columns);
  const nextSize = {
    columns: Math.max(
      min.columns,
      Math.min(layout.columns, size.columns + edge.x * offset.column),
    ),
    rows: Math.max(
      min.rows,
      Math.min(layout.rows, size.rows + edge.y * offset.row),
    ),
  };
  const next = {
    ...layout,
    tiles: { ...layout.tiles, [tile]: { ...size, ...nextSize } },
  };

  if (layout.freePositions) {
    const { column, row } = layout.freePositions[tile];
    next.freePositions = {
      ...layout.freePositions,
      [tile]: {
        column: edge.x < 0 ? column + size.columns - nextSize.columns : column,
        row: edge.y < 0 ? row + size.rows - nextSize.rows : row,
      },
    };
  }

  return placeTiles(next) ? next : null;
}

export function tileOrder(layout: DashboardLayout) {
  return layout.order ?? Object.keys(layout.tiles);
}

export function tileKind(layout: DashboardLayout, tile: TileId): TileKind {
  // Older saved layouts used the kind itself as the tile ID.
  return layout.tiles[tile].kind ?? (tile as TileKind);
}

export function tileTitle(layout: DashboardLayout, tile: TileId) {
  return layout.tiles[tile].title ?? tileName(tileKind(layout, tile));
}

export function addTile(
  layout: DashboardLayout,
  kind: TileKind,
  display?: TileDisplay,
  dataKey?: string,
  cameraIds?: readonly string[],
) {
  const id = crypto.randomUUID();
  const size = minimumSize(kind, layout.columns);
  const next = {
    ...layout,
    order: [...tileOrder(layout), id],
    tiles: {
      ...layout.tiles,
      [id]: { ...size, kind, display, dataKey, cameraIds },
    },
  };

  if (!layout.freePositions) return placeTiles(next) ? next : null;

  for (let row = 1; row + size.rows - 1 <= layout.rows; row++) {
    for (
      let column = 1;
      column + size.columns - 1 <= layout.columns;
      column++
    ) {
      const candidate = {
        ...next,
        freePositions: { ...layout.freePositions, [id]: { row, column } },
      };
      if (placeTiles(candidate)) return candidate;
    }
  }
  return null;
}

export function removeTile(layout: DashboardLayout, id: TileId) {
  const tiles = { ...layout.tiles };
  delete tiles[id];
  const next = {
    ...layout,
    tiles,
    order: tileOrder(layout).filter((tile) => tile !== id),
  };
  if (layout.freePositions) {
    next.freePositions = { ...layout.freePositions };
    delete next.freePositions[id];
  }
  return next;
}

export function updateTile(
  layout: DashboardLayout,
  tile: TileId,
  title: string,
  size: TileSize,
  display?: TileDisplay,
  kind = tileKind(layout, tile),
  dataKey?: string,
  cameraIds?: readonly string[],
) {
  const current = layout.tiles[tile];
  const next = resizeTile(
    { ...layout, tiles: { ...layout.tiles, [tile]: { ...current, kind } } },
    tile,
    { x: 1, y: 1 },
    {
      column: size.columns - current.columns,
      row: size.rows - current.rows,
    },
  );
  if (!next) return null;
  next.tiles[tile] = {
    ...next.tiles[tile],
    title,
    display: display ?? current.display,
    dataKey,
    cameraIds,
  };
  return next;
}

export function filterDashboardLayout(
  layout: DashboardLayout,
  permitted: readonly SystemId[],
) {
  return tileOrder(layout).reduce((visible, tile) => {
    return permitted.includes(tileSystem(tileKind(layout, tile)))
      ? visible
      : removeTile(visible, tile);
  }, layout);
}

// Pack older layouts in saved order. Free placement retains explicit positions after migration.
export function normalizeDashboardLayout(
  layout: DashboardLayout,
): DashboardLayout {
  if (layout.columns <= 4) return layout;
  const columns = 4;
  const order = tileOrder(layout);
  const tiles = { ...layout.tiles };
  const positions: TilePositions = {};
  const occupied = new Set<number>();
  let rows = layout.rows;
  for (const id of order) {
    const tile = {
      ...tiles[id],
      columns: Math.min(columns, tiles[id].columns),
    };
    tiles[id] = tile;
    for (let index = 0; ; index++) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      if (column + tile.columns > columns) continue;
      const cells = Array.from({ length: tile.rows }, (_, y) =>
        Array.from({ length: tile.columns }, (_, x) => index + y * columns + x),
      ).flat();
      if (cells.some((cell) => occupied.has(cell))) continue;
      cells.forEach((cell) => occupied.add(cell));
      positions[id] = { column: column + 1, row: row + 1 };
      rows = Math.max(rows, row + tile.rows);
      break;
    }
  }
  return {
    ...layout,
    columns,
    rows,
    tiles,
    freePositions: layout.freePositions ? positions : undefined,
  };
}
