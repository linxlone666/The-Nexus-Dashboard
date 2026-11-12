'use client';

import React, { useRef, useState, type DragEvent, type PointerEvent } from 'react';

type ViewMode =
  | 'edit-dashboard'
  | 'edit-dashboard-add-tile'
  | 'edit-dashboard-tile-settings'
  | 'activity'
  | 'incident-detail'
  | 'camera-detail'
  | 'alarm-sensor-detail'
  | 'alarms'
  | 'access-parking'
  | 'my-views'
  | 'ai-layout-preview'
  | 'device-access-revoked';

type TileSize = {
  width: number;
  height: number;
};

export default function NexusDashboardPage() {
  const [currentView, setCurrentView] =
    useState<ViewMode>('edit-dashboard');

  const [selectedRecord, setSelectedRecord] =
    useState('Loading dock motion');

  return (
    <div className="min-h-screen bg-[#F3F7F5] font-sans text-slate-800 flex flex-col relative overflow-x-hidden">

      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => setCurrentView('edit-dashboard')}
        >
          <span className="font-extrabold text-xl text-slate-900">
            nexus.
          </span>
          <span className="text-xs font-semibold text-gray-500 pl-3 border-l">
            Nexus Headquarters
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search devices and events"
            className="px-4 py-2 bg-slate-100 text-xs rounded-md w-64"
          />

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#D1EBE4] text-[#085046] font-bold text-xs flex items-center justify-center">
              AL
            </div>
            <span className="text-sm font-semibold">Alex</span>
          </div>
        </div>
      </header>

      {/* NAVIGATION */}

      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center space-x-2 overflow-x-auto shrink-0">
        <span className="text-slate-400 font-semibold pr-2">
          สลับพรีวิว:
        </span>

        {([
          ['edit-dashboard', '1. Edit Dashboard'],
          ['edit-dashboard-add-tile', '2. Add Tile Modal'],
          ['edit-dashboard-tile-settings', '3. Tile Settings'],
          ['activity', '4. Activity'],
          ['incident-detail', '5. Incident Detail'],
          ['camera-detail', '6. Camera Detail'],
          ['alarm-sensor-detail', '7. Sensor Detail'],
          ['alarms', '8. Alarms'],
          ['access-parking', '9. Access & Parking'],
          ['my-views', '10. My views'],
          ['ai-layout-preview', '11. AI Layout Preview'],
          ['device-access-revoked', '12. Access Revoked'],
        ] as [ViewMode, string][]).map(([view, label]) => (
          <button
            key={view}
            onClick={() => setCurrentView(view)}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              currentView === view
                ? 'bg-[#0B6B5D] font-bold'
                : 'hover:bg-slate-800 text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto pb-20">

        {currentView.startsWith('edit-dashboard') && (
          <EditDashboardView
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'activity' && (
          <ActivityView
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            setCurrentView={setCurrentView}
          />
        )}

        {currentView === 'incident-detail' && <IncidentDetailView />}
        {currentView === 'camera-detail' && <CameraDetailView />}
        {currentView === 'alarm-sensor-detail' && <AlarmSensorDetailView />}

        {currentView === 'alarms' && (
          <AlarmsView setCurrentView={setCurrentView} />
        )}

        {currentView === 'access-parking' && <AccessParkingView />}
        {currentView === 'my-views' && <MyViewsView />}
        {currentView === 'ai-layout-preview' && <AILayoutPreviewView />}
        {currentView === 'device-access-revoked' && <DeviceAccessRevokedView />}

      </main>

      <div className="fixed bottom-6 left-6 z-50">
        <button className="w-12 h-12 rounded-full bg-[#084A41] text-white flex items-center justify-center shadow-lg">
          ☰
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   1. EDIT DASHBOARD
========================================== */

function EditDashboardView({
  currentView,
  setCurrentView,
}: {
  currentView: ViewMode;
  setCurrentView: (v: ViewMode) => void;
}) {
  const [addedTiles, setAddedTiles] = useState<string[]>([]);

  const [tileOrder, setTileOrder] = useState<string[]>([
    'Live cameras',
    'Priority incidents',
    'Access activity',
  ]);

  const [tileSizes, setTileSizes] = useState<
    Record<string, TileSize>
  >({});

  const [isDragging, setIsDragging] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  const updateTileSize = (tile: string, size: TileSize) => {
    setTileSizes((prev) => ({ ...prev, [tile]: size }));
  };

  // RESIZE POPUP

  const [selectedTile, setSelectedTile] = useState<string | null>(null);

  const [tempSize, setTempSize] = useState<TileSize>({
    width: 5,
    height: 180,
  });

  const openResizePopup = (tile: string) => {
    const size = tileSizes[tile] || { width: 5, height: 180 };

    setSelectedTile(tile);
    setTempSize(size);
  };

  const applyResize = () => {
    if (!selectedTile) return;

    setTileSizes((prev) => ({
      ...prev,
      [selectedTile]: tempSize,
    }));

    setSelectedTile(null);
  };

  // ADD TILE

  const addTile = (tile: string) => {
    setAddedTiles((prev) =>
      prev.includes(tile) ? prev : [...prev, tile]
    );

    setTileOrder((prev) =>
      prev.includes(tile) ? prev : [...prev, tile]
    );
  };

  // MOVE TILE

  const moveTile = (draggedTile: string, targetTile: string) => {
    if (draggedTile === targetTile) return;

    setTileOrder((prev) => {
      const next = [...prev];

      const fromIndex = next.indexOf(draggedTile);
      const toIndex = next.indexOf(targetTile);

      if (fromIndex === -1 || toIndex === -1) return prev;

      next.splice(fromIndex, 1);
      next.splice(toIndex, 0, draggedTile);

      return next;
    });
  };

  // REMOVE TILE

  const removeTile = (tile: string) => {
    setAddedTiles((prev) =>
      prev.filter((item) => item !== tile)
    );

    setTileOrder((prev) =>
      prev.filter((item) => item !== tile)
    );

    setTileSizes((prev) => {
      const newSizes = { ...prev };
      delete newSizes[tile];
      return newSizes;
    });
  };

  // DRAG AND DROP เพิ่ม TILE

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const tile = event.dataTransfer.getData('text/plain');

    if (tile) {
      addTile(tile);
    }

    setIsDragging(false);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
          NEXUS / MY VIEWS / CONTROL ROOM
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-extrabold text-slate-900">
              Edit dashboard
            </h1>

            <span className="bg-[#FFF4E5] text-[#9A5B00] text-xs font-semibold px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-5 py-2 bg-white border rounded-md text-xs">
              Cancel
            </button>

            <button
              onClick={() => {
                setAddedTiles([]);
                setTileSizes({});

                setTileOrder([
                  'Live cameras',
                  'Priority incidents',
                  'Access activity',
                ]);
              }}
              className="px-5 py-2 bg-white border rounded-md text-xs"
            >
              Reset view
            </button>

            <button className="px-6 py-2 bg-[#0B6B5D] text-white rounded-md text-xs">
              Save layout
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-1">
          Control room · Personal layout
        </p>
      </div>

      {/* TOOLBAR */}

      <div className="bg-white p-3 rounded-xl border flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">

          <button
            onClick={() => setCurrentView('edit-dashboard-add-tile')}
            className="px-4 py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold"
          >
            + Add tile
          </button>

          <button className="px-4 py-2 bg-white border rounded-md text-xs">
            ↶ Undo
          </button>

          <button className="px-4 py-2 bg-white border rounded-md text-xs">
            ↷ Redo
          </button>

          <button className="px-4 py-2 bg-white border rounded-md text-xs">
            ✧ Build with AI
          </button>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <span className="font-bold">Desktop</span>
          <span className="text-gray-400">12-column grid</span>
        </div>
      </div>

      {/* DASHBOARD GRID */}

      <div className="flex gap-6 relative">

        <div className="flex-1 min-w-0">

          <div ref={gridRef} className="grid grid-cols-12 gap-6">

            {/* LIVE CAMERAS */}

            <ResizableTile
              tileKey="Live cameras"
              order={tileOrder.indexOf('Live cameras')}
              onMove={moveTile}
              size={tileSizes['Live cameras'] || { width: 7, height: 280 }}
              gridRef={gridRef}
              onResize={updateTileSize}
            >
              <div
                onClick={() => setCurrentView('edit-dashboard-tile-settings')}
                className="h-full bg-white rounded-xl border-2 border-[#0B6B5D] p-4 shadow-sm cursor-pointer"
              >
                <div className="flex justify-between mb-3">
                  <h3 className="font-bold text-sm">
                    Live cameras
                  </h3>
                  <span className="text-gray-400">⋮</span>
                </div>

                <p className="text-xs text-gray-400 mb-3">
                  CCTV · 2 sources
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800 h-40 rounded-lg flex flex-col justify-between p-3">
                    <span className="text-white text-xs">🔴 LIVE</span>
                    <span className="text-white text-xs font-semibold">
                      Lobby camera
                    </span>
                  </div>

                  <div className="bg-slate-800 h-40 rounded-lg flex flex-col justify-between p-3">
                    <span className="text-white text-xs">🔴 LIVE</span>
                    <span className="text-white text-xs font-semibold">
                      Parking entrance
                    </span>
                  </div>
                </div>
              </div>
            </ResizableTile>

            {/* PRIORITY INCIDENTS */}

            <ResizableTile
              tileKey="Priority incidents"
              order={tileOrder.indexOf('Priority incidents')}
              onMove={moveTile}
              size={tileSizes['Priority incidents'] || { width: 5, height: 240 }}
              gridRef={gridRef}
              onResize={updateTileSize}
            >
              <div className="h-full bg-white rounded-xl border p-4 shadow-sm">
                <h3 className="font-bold text-sm">
                  Priority incidents
                </h3>

                <p className="text-xs text-gray-400 mb-4">
                  Alarms · Latest 24 hours
                </p>

                <div className="divide-y text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="font-bold">
                      Restricted area intrusion
                    </span>
                    <span className="text-red-700 bg-red-50 px-2 rounded">
                      High
                    </span>
                  </div>

                  <div className="py-2 flex justify-between">
                    <span className="font-bold">
                      Emergency exit opened
                    </span>
                    <span>New</span>
                  </div>

                  <div className="py-2 flex justify-between">
                    <span className="font-bold">Sensor offline</span>
                    <span className="text-gray-400">Offline</span>
                  </div>
                </div>
              </div>
            </ResizableTile>

            {/* ACCESS ACTIVITY */}

            <ResizableTile
              tileKey="Access activity"
              order={tileOrder.indexOf('Access activity')}
              onMove={moveTile}
              size={tileSizes['Access activity'] || { width: 7, height: 220 }}
              gridRef={gridRef}
              onResize={updateTileSize}
            >
              <div className="h-full bg-white rounded-xl border p-4 shadow-sm">
                <h3 className="font-bold text-sm mb-1">
                  Access activity
                </h3>

                <p className="text-xs text-gray-400 mb-6">
                  Access control · Today
                </p>

                <div className="h-28">
                  <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                    <path
                      d="M0,80 L70,70 L140,75 L210,60 L280,68 L350,55 L420,58 L500,62"
                      fill="none"
                      stroke="#0B6B5D"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
            </ResizableTile>

            {/* ADDED TILES */}

            {addedTiles.map((tile) => {
              const size = tileSizes[tile] || {
                width: 5,
                height: 180,
              };

              return (
                <ResizableTile
                  key={tile}
                  tileKey={tile}
                  order={tileOrder.indexOf(tile)}
                  onMove={moveTile}
                  size={size}
                  gridRef={gridRef}
                  onResize={updateTileSize}
                >
                  <div className="h-full bg-white rounded-xl border-2 border-emerald-200 p-4 shadow-sm relative">

                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {tile}
                      </h3>

                      <button
                        onClick={() => removeTile(tile)}
                        className="text-gray-400 hover:text-red-600 text-xs"
                      >
                        ✕
                      </button>
                    </div>

                    <p className="text-xs text-gray-500">
                      Tile added to your dashboard
                    </p>

                    <div className="mt-4 rounded-lg bg-[#EEF5F3] h-20 flex items-center justify-center text-[#0B6B5D] text-sm font-semibold">
                      {tile} preview
                    </div>

                    <div className="mt-4 border-t pt-3 flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        ขนาด {size.width}/12 คอลัมน์ · {size.height}px
                      </p>

                      <button
                        onClick={() => openResizePopup(tile)}
                        className="px-3 py-2 bg-[#EEF5F3] text-[#0B6B5D] rounded-md text-xs font-semibold hover:bg-emerald-100"
                      >
                        ปรับขนาด
                      </button>
                    </div>
                  </div>
                </ResizableTile>
              );
            })}

            {/* DROP ZONE */}

            <div
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`col-span-5 min-h-52 border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition ${
                isDragging
                  ? 'border-[#0B6B5D] bg-emerald-100'
                  : 'border-emerald-300/80 bg-emerald-50/20 hover:bg-emerald-50/60'
              }`}
            >
              <p className="text-emerald-800 font-bold text-sm mb-1">
                + Drop a tile here
              </p>

              <p className="text-xs text-emerald-600">
                {isDragging
                  ? 'Release to add this tile'
                  : 'Or choose Add tile from the toolbar.'}
              </p>
            </div>

          </div>
        </div>

        {/* SIDE PANELS */}

        {currentView === 'edit-dashboard-add-tile' && (
          <AddTileSidePanel
            onClose={() => setCurrentView('edit-dashboard')}
            addedTiles={addedTiles}
            onAddTile={addTile}
          />
        )}

        {currentView === 'edit-dashboard-tile-settings' && (
          <TileSettingsSidePanel
            onClose={() => setCurrentView('edit-dashboard')}
          />
        )}

      </div>

      {/* RESIZE POPUP */}

      {selectedTile && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelectedTile(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  ปรับขนาด Tile
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedTile}
                </p>
              </div>

              <button
                onClick={() => setSelectedTile(null)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-semibold">ความกว้าง</label>
                <span className="text-[#0B6B5D] font-bold">
                  {tempSize.width} / 12 คอลัมน์
                </span>
              </div>

              <input
                type="range"
                min="3"
                max="12"
                value={tempSize.width}
                onChange={(event) =>
                  setTempSize((prev) => ({
                    ...prev,
                    width: Number(event.target.value),
                  }))
                }
                className="w-full accent-[#0B6B5D]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-semibold">ความสูง</label>
                <span className="text-[#0B6B5D] font-bold">
                  {tempSize.height}px
                </span>
              </div>

              <input
                type="range"
                min="160"
                max="500"
                step="20"
                value={tempSize.height}
                onChange={(event) =>
                  setTempSize((prev) => ({
                    ...prev,
                    height: Number(event.target.value),
                  }))
                }
                className="w-full accent-[#0B6B5D]"
              />
            </div>

            <div className="bg-[#F3F7F5] rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">
                ตัวอย่างขนาด
              </p>

              <div
                className="bg-[#D9EAE4] rounded-lg flex items-center justify-center text-[#0B6B5D] text-xs font-bold transition-all"
                style={{
                  width: `${(tempSize.width / 12) * 100}%`,
                  height: `${Math.min(tempSize.height / 2, 180)}px`,
                }}
              >
                {selectedTile}
              </div>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => setTempSize({ width: 5, height: 180 })}
                className="px-4 py-2 border rounded-md text-xs"
              >
                Reset
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTile(null)}
                  className="px-4 py-2 border rounded-md text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={applyResize}
                  className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ==========================================
   RESIZABLE TILE
========================================== */

type ResizeDirection = 'width' | 'height' | 'both';

function ResizableTile({
  tileKey,
  size,
  order,
  onMove,
  gridRef,
  onResize,
  children,
}: {
  tileKey: string;
  size: TileSize;
  order: number;
  onMove: (draggedTile: string, targetTile: string) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
  onResize: (tile: string, size: TileSize) => void;
  children: React.ReactNode;
}) {
  const dragStart = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    direction: ResizeDirection;
  } | null>(null);

  const startResize = (
    event: PointerEvent<HTMLDivElement>,
    direction: ResizeDirection
  ) => {
    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.setPointerCapture(event.pointerId);

    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      width: size.width,
      height: size.height,
      direction,
    };
  };

  const moveResize = (event: PointerEvent<HTMLDivElement>) => {
    const start = dragStart.current;
    if (!start) return;

    const gridWidth = gridRef.current?.getBoundingClientRect().width || 1200;

    const gap = 24;
    const cellWidth = (gridWidth - gap * 11) / 12;
    const columnStep = cellWidth + gap;

    const columnChange = Math.round(
      (event.clientX - start.x) / columnStep
    );

    const rowChange = Math.round(
      (event.clientY - start.y) / 20
    ) * 20;

    onResize(tileKey, {
      width: start.direction === 'height'
        ? start.width
        : Math.max(1, Math.min(12, start.width + columnChange)),

      height: start.direction === 'width'
        ? start.height
        : Math.max(120, Math.min(800, start.height + rowChange)),
    });
  };

  const stopResize = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStart.current = null;
  };

  const handleClass =
    'absolute z-20 rounded-full bg-[#0B6B5D] border-2 border-white shadow-md opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:scale-110 transition-opacity touch-none select-none';

  return (
    <div
      draggable
      onDragStart={(event) => {
        const target = event.target as HTMLElement;

        // ไม่เริ่มลากจากปุ่ม ช่องกรอก หรือจุดปรับขนาด
        if (
          target.closest(
            'button, input, textarea, select, [role="separator"]'
          )
        ) {
          event.preventDefault();
          return;
        }

        event.dataTransfer.setData(
          'application/x-nexus-tile',
          tileKey
        );

        event.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(event) => {
        if (
          event.dataTransfer.types.includes(
            'application/x-nexus-tile'
          )
        ) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }
      }}
      onDrop={(event) => {
        const draggedTile = event.dataTransfer.getData(
          'application/x-nexus-tile'
        );

        if (!draggedTile) return;

        event.preventDefault();
        event.stopPropagation();

        onMove(draggedTile, tileKey);
      }}
      className="relative group min-w-0 cursor-grab active:cursor-grabbing"
      style={{
        gridColumn: `span ${size.width}`,
        height: `${size.height}px`,
        order,
      }}
    >
      {children}

      {/* ลากขอบขวาเพื่อปรับความกว้าง */}

      <div
        role="separator"
        tabIndex={0}
        aria-label={`ปรับความกว้าง ${tileKey}`}
        onPointerDown={(event) => startResize(event, 'width')}
        onPointerMove={moveResize}
        onPointerUp={stopResize}
        onPointerCancel={stopResize}
        className={`${handleClass} right-[-5px] top-1/2 -translate-y-1/2 w-3 h-12 cursor-ew-resize`}
      />

      {/* ลากขอบล่างเพื่อปรับความสูง */}

      <div
        role="separator"
        tabIndex={0}
        aria-label={`ปรับความสูง ${tileKey}`}
        onPointerDown={(event) => startResize(event, 'height')}
        onPointerMove={moveResize}
        onPointerUp={stopResize}
        onPointerCancel={stopResize}
        className={`${handleClass} bottom-[-5px] left-1/2 -translate-x-1/2 w-12 h-3 cursor-ns-resize`}
      />

      {/* ลากมุมขวาล่างเพื่อปรับทั้งสองด้าน */}

      <div
        role="separator"
        tabIndex={0}
        aria-label={`ปรับความกว้างและความสูง ${tileKey}`}
        onPointerDown={(event) => startResize(event, 'both')}
        onPointerMove={moveResize}
        onPointerUp={stopResize}
        onPointerCancel={stopResize}
        className={`${handleClass} right-[-6px] bottom-[-6px] w-4 h-4 cursor-nwse-resize`}
      />
    </div>
  );
}

/* ==========================================
   2. ADD TILE PANEL
========================================== */

function AddTileSidePanel({
  onClose,
  addedTiles,
  onAddTile,
}: {
  onClose: () => void;
  addedTiles: string[];
  onAddTile: (tile: string) => void;
}) {
  const [search, setSearch] = useState('');

  const tiles = [
    'Lobby camera',
    'Alarm feed',
    'Temperature',
    'Access activity',
  ];

  const filteredTiles = tiles.filter((tile) =>
    tile.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border rounded-xl p-5 shadow-xl space-y-4 shrink-0">

      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">Add a tile</h2>

        <button onClick={onClose} className="text-gray-400">
          ✕
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Choose a tile and a source you can access.
      </p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by device or tile type"
        className="w-full px-3 py-2 border rounded-md text-xs"
      />

      <div className="space-y-2">

        {filteredTiles.map((tile) => (
          <div
            key={tile}
            draggable={!addedTiles.includes(tile)}
            onDragStart={(event) => {
              event.dataTransfer.setData('text/plain', tile);
              event.dataTransfer.effectAllowed = 'copy';
            }}
            className="border rounded-lg p-3 flex justify-between items-center"
          >
            <span className="text-xs font-bold">
              {tile}
            </span>

            <button
              onClick={() => onAddTile(tile)}
              disabled={addedTiles.includes(tile)}
              className="px-2.5 py-1 border rounded text-xs disabled:bg-emerald-50 disabled:text-emerald-700 disabled:cursor-not-allowed"
            >
              {addedTiles.includes(tile) ? 'Added' : '+ Add'}
            </button>
          </div>
        ))}

        {filteredTiles.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">
            No tiles found
          </p>
        )}

      </div>

      <button
        onClick={onClose}
        className="w-full py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold"
      >
        Done
      </button>
    </div>
  );
}/* ==========================================
   3. TILE SETTINGS PANEL
========================================== */

function TileSettingsSidePanel({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="w-80 bg-white border rounded-xl p-5 shadow-xl space-y-4">

      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">Tile settings</h2>

        <button onClick={onClose} className="text-gray-400">
          ✕
        </button>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="font-bold block mb-1">Title</label>
          <input
            type="text"
            defaultValue="Live cameras"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="font-bold block mb-1">Data source</label>
          <input
            type="text"
            defaultValue="Lobby and parking cameras"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-md text-xs flex-1"
        >
          Cancel
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#0B6B5D] text-white rounded-md text-xs flex-1"
        >
          Apply settings
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   4. ACTIVITY VIEW
========================================== */

function ActivityView({
  selectedRecord,
  setSelectedRecord,
  setCurrentView,
}: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Activity</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm">
          <table className="w-full text-left text-xs">
            <tbody>
              {[
                ['Loading dock motion', 'High · 09:48'],
                ['Lobby camera restored', 'Resolved · 09:42'],
              ].map(([name, status]) => (
                <tr
                  key={name}
                  onClick={() => setSelectedRecord(name)}
                  className="cursor-pointer border-b hover:bg-slate-50"
                >
                  <td className="py-3 px-3 font-bold">{name}</td>
                  <td className="py-3 px-3">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between">
          <h3 className="text-lg font-bold">{selectedRecord}</h3>

          <button
            onClick={() => setCurrentView('incident-detail')}
            className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs w-fit"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   5. INCIDENT DETAIL
========================================== */

function IncidentDetailView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Incident detail</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 space-y-4">
          <h2 className="text-xl font-bold">
            Loading dock motion detected
          </h2>

          <div className="bg-[#EEF5F3] p-4 rounded-lg">
            <p className="text-xs font-bold">
              Related camera: Loading dock
            </p>
          </div>

          <button className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs">
            Acknowledge event
          </button>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">Event timeline</h3>
          <p className="text-xs">09:48 · Motion detected</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   6. CAMERA DETAIL
========================================== */

function CameraDetailView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Camera detail</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6">
          <div className="bg-[#363636] h-64 rounded-lg flex items-center justify-center text-white">
            Last frame unavailable
          </div>
          <h3 className="font-bold mt-4">Parking entrance</h3>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">Device information</h3>
          <p className="text-xs">Parking entrance · Offline</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   7. SENSOR DETAIL
========================================== */

function AlarmSensorDetailView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">
        Alarm and sensor detail
      </h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-2">
            Loading dock motion sensor
          </h2>
          <p className="text-xs text-gray-500">Online · Zone B</p>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">Activity timeline</h3>
          <p className="text-xs">09:48 · Detected</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   8. ALARMS VIEW
========================================== */

function AlarmsView({
  setCurrentView,
}: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Alarms</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6">
          <p className="text-xs font-bold">
            Loading dock motion · High
          </p>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6">
          <button
            onClick={() => setCurrentView('alarm-sensor-detail')}
            className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs"
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}/* ==========================================
   9. ACCESS & PARKING
========================================== */

function AccessParkingView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Access & parking</h1>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6">
          <p className="text-xs font-bold">
            West entrance · Badge accepted
          </p>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6">
          <p className="text-xs">Details history</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   10. MY VIEWS
========================================== */

function MyViewsView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400">
          USER / MY VIEWS
        </div>
        <h1 className="text-3xl font-extrabold">My views</h1>
      </div>

      <div className="bg-white rounded-2xl border p-8 shadow-sm">
        <h2 className="text-lg font-bold mb-6">Saved dashboards</h2>

        <div className="grid grid-cols-3 gap-6">
          {['Control room', 'Alarm response', 'New dashboard'].map((name) => (
            <div
              key={name}
              className="bg-[#F8F9F9] border rounded-xl p-5 flex flex-col justify-between h-56 cursor-pointer hover:border-[#0B6B5D]"
            >
              <h3 className="font-bold text-sm">{name}</h3>
              <div className="bg-[#D9EAE4] h-28 rounded-lg" />
              <p className="text-xs text-gray-500">Preview</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   11. AI LAYOUT PREVIEW
========================================== */

function AILayoutPreviewView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400">
          NEXUS / USER / AI LAYOUT PREVIEW
        </div>

        <h1 className="text-3xl font-extrabold">
          Operations overview
        </h1>

        <p className="text-xs text-gray-500">
          Nexus Headquarters · Control room
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          ['Cameras online', '48 / 50'],
          ['Active alarms', '03'],
          ['People on site', '1,284'],
          ['Parking available', '64'],
        ].map(([title, value]) => (
          <div key={title} className="bg-white p-4 rounded-xl border shadow-sm">
            <p className="text-xs text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 bg-white rounded-xl border p-6 space-y-4">
          <h3 className="font-bold text-sm">Live cameras</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#D9EAE4] h-36 rounded-lg p-4 flex items-end text-xs font-bold">
              Parking entrance
            </div>

            <div className="bg-[#D9EAE4] h-36 rounded-lg p-4 flex items-end text-xs font-bold">
              Lobby camera
            </div>
          </div>
        </div>

        <div className="w-96 bg-white border rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="font-bold">AI layout preview</h2>

          <input
            type="text"
            defaultValue="Put active alarms first and show the lobby camera."
            className="w-full px-3 py-2 border rounded-md text-xs"
          />

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-gray-50 border rounded-md font-bold">
              1 Priority incidents
            </div>
            <div className="p-2.5 bg-gray-50 border rounded-md font-bold">
              2 Lobby camera
            </div>
            <div className="p-2.5 bg-gray-50 border rounded-md font-bold">
              3 Recent activity
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 border rounded-md text-xs flex-1">
              Cancel
            </button>

            <button className="px-4 py-2 bg-[#0B6B5D] text-white rounded-md text-xs flex-1">
              Apply layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   12. DEVICE ACCESS REVOKED
========================================== */

function DeviceAccessRevokedView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400">
          USER / DEVICE ACCESS REVOKED
        </div>

        <h1 className="text-3xl font-extrabold">
          Device access revoked
        </h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 space-y-6">
          <h2 className="text-base font-bold">
            Event and device information
          </h2>

          <div className="space-y-4 text-xs divide-y">
            <div className="pt-2">
              <h4 className="font-bold text-sm">Parking camera</h4>
              <p className="text-gray-400">Unavailable</p>
            </div>

            <div className="pt-4">
              <h4 className="font-bold text-sm">Permission changed</h4>
              <p className="text-gray-500">
                Contact your site administrator
              </p>
            </div>

            <div className="pt-4">
              <h4 className="font-bold text-sm">Dashboard tile</h4>
              <p className="text-gray-500">
                Choose another camera or remove tile
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-4">
              Activity timeline
            </h3>

            <div className="space-y-3 text-xs">
              <p className="font-bold">09:48 · Detected</p>
              <p className="font-bold">09:49 · Opened for review</p>
              <p className="font-bold">09:50 · Status updated</p>
            </div>
          </div>

          <button className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs w-fit">
            Choose another camera
          </button>
        </div>
      </div>
    </div>
  );
}