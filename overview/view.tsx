'use client';

import React, { useState } from 'react';

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

export default function NexusDashboardPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('edit-dashboard');
  const [selectedRecord, setSelectedRecord] = useState<string>('Loading dock motion');

  return (
    <div className="min-h-screen bg-[#F3F7F5] font-sans text-slate-800 flex flex-col relative overflow-x-hidden selection:bg-[#0B6B5D] selection:text-white">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('edit-dashboard')}>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">nexus.</span>
            <span className="text-xs font-semibold text-gray-500 pl-3 border-l border-gray-300">Nexus Headquarters</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex items-center">
            <svg className="w-4 h-4 absolute left-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text"
              placeholder="Search devices and events"
              className="pl-9 pr-4 py-1.5 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-[#0B6B5D] transition"
            />
          </div>

          <div className="flex items-center space-x-2 pl-2">
            <div className="w-8 h-8 rounded-full bg-[#D1EBE4] text-[#085046] font-bold text-xs flex items-center justify-center">
              AL
            </div>
            <span className="text-sm font-semibold text-slate-700">Alex</span>
          </div>
        </div>
      </header>

      {/* Toolbar สลับดูทั้ง 12 หน้าจอ */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center space-x-2 overflow-x-auto shrink-0 shadow-inner">
        <span className="text-slate-400 font-semibold pr-2">สลับพรีวิว:</span>
        <button onClick={() => setCurrentView('edit-dashboard')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'edit-dashboard' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>1. Edit Dashboard</button>
        <button onClick={() => setCurrentView('edit-dashboard-add-tile')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'edit-dashboard-add-tile' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>2. Add Tile Modal</button>
        <button onClick={() => setCurrentView('edit-dashboard-tile-settings')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'edit-dashboard-tile-settings' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>3. Tile Settings</button>
        <button onClick={() => setCurrentView('activity')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'activity' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>4. Activity</button>
        <button onClick={() => setCurrentView('incident-detail')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'incident-detail' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>5. Incident Detail</button>
        <button onClick={() => setCurrentView('camera-detail')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'camera-detail' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>6. Camera Detail</button>
        <button onClick={() => setCurrentView('alarm-sensor-detail')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'alarm-sensor-detail' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>7. Sensor Detail</button>
        <button onClick={() => setCurrentView('alarms')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'alarms' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>8. Alarms</button>
        <button onClick={() => setCurrentView('access-parking')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'access-parking' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>9. Access & Parking</button>
        <button onClick={() => setCurrentView('my-views')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'my-views' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>10. My views</button>
        <button onClick={() => setCurrentView('ai-layout-preview')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'ai-layout-preview' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>11. AI Layout Preview</button>
        <button onClick={() => setCurrentView('device-access-revoked')} className={`px-2.5 py-1 rounded transition whitespace-nowrap ${currentView === 'device-access-revoked' ? 'bg-[#0B6B5D] font-bold' : 'hover:bg-slate-800 text-gray-300'}`}>12. Access Revoked</button>
      </div>

      {/* Main Container */}
      <main className="flex-1 p-8 max-w-[1600px] w-full mx-auto relative pb-20">
        {currentView.startsWith('edit-dashboard') && (
          <EditDashboardView currentView={currentView} setCurrentView={setCurrentView} />
        )}
        {currentView === 'activity' && (
          <ActivityView selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord} setCurrentView={setCurrentView} />
        )}
        {currentView === 'incident-detail' && <IncidentDetailView />}
        {currentView === 'camera-detail' && <CameraDetailView />}
        {currentView === 'alarm-sensor-detail' && <AlarmSensorDetailView />}
        {currentView === 'alarms' && (
          <AlarmsView selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord} setCurrentView={setCurrentView} />
        )}
        {currentView === 'access-parking' && (
          <AccessParkingView selectedRecord={selectedRecord} setSelectedRecord={setSelectedRecord} />
        )}
        {currentView === 'my-views' && <MyViewsView />}
        {currentView === 'ai-layout-preview' && <AILayoutPreviewView />}
        {currentView === 'device-access-revoked' && <DeviceAccessRevokedView />}
      </main>

      {/* Floating Menu Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <button className="w-12 h-12 rounded-full bg-[#084A41] text-white flex items-center justify-center shadow-lg hover:bg-[#063932] transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ==========================================
   หน้าจอทั้งหมด 12 COMPONENTS
   ========================================== */

// 1. EDIT DASHBOARD
function EditDashboardView({ 
  currentView, 
  setCurrentView 
}: { 
  currentView: ViewMode; 
  setCurrentView: (v: ViewMode) => void; 
}) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
          NEXUS / MY VIEWS / CONTROL ROOM
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-extrabold text-slate-900">Edit dashboard</h1>
            <span className="bg-[#FFF4E5] text-[#9A5B00] text-xs font-semibold px-3 py-1 rounded-full">
              Unsaved changes
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button className="px-5 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
            <button className="px-5 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">Reset view</button>
            <button className="px-6 py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold hover:bg-[#085046] transition shadow-sm">Save layout</button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Control room · Personal layout</p>
      </div>

      <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button onClick={() => setCurrentView('edit-dashboard-add-tile')} className="px-4 py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold flex items-center space-x-2 hover:bg-[#085046] transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            <span>Add tile</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-md text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 10h10a5 5 0 0 1 5 5v2M3 10l5-5M3 10l5 5"/></svg>
            <span>Undo</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-md text-xs font-semibold flex items-center space-x-1.5 hover:bg-slate-50">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10H11a5 5 0 0 0-5 5v2M21 10l-5-5M21 10l-5 5"/></svg>
            <span>Redo</span>
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-md text-xs font-semibold flex items-center space-x-2 hover:bg-slate-50">
            <svg className="w-4 h-4 text-[#0B6B5D]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span>Build with AI</span>
          </button>
        </div>

        <div className="flex items-center space-x-6 text-xs">
          <span className="font-bold text-slate-800">Desktop</span>
          <span className="text-gray-400">12-column grid</span>
        </div>
      </div>

      <div className="flex space-x-6 relative">
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-12 gap-6">

            <div onClick={() => setCurrentView('edit-dashboard-tile-settings')} className="col-span-7 bg-white rounded-xl border-2 border-[#0B6B5D] p-4 shadow-sm relative cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#0B6B5D]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m15 10 4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z"/></svg>
                  <h3 className="font-bold text-slate-900 text-sm">Live cameras</h3>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3 -mt-2">CCTV · 2 sources</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative bg-slate-800 h-40 rounded-lg overflow-hidden border border-slate-700 flex flex-col justify-between p-3">
                  <span className="bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded w-fit flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> LIVE
                  </span>
                  <div className="z-10 text-white text-xs font-semibold bg-slate-900/60 p-1 px-2 rounded w-fit">Lobby camera</div>
                </div>

                <div className="relative bg-slate-800 h-40 rounded-lg overflow-hidden border border-slate-700 flex flex-col justify-between p-3">
                  <span className="bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded w-fit flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> LIVE
                  </span>
                  <div className="z-10 text-white text-xs font-semibold bg-slate-900/60 p-1 px-2 rounded w-fit">Parking entrance</div>
                </div>
              </div>
              <div className="absolute bottom-1 right-2 bg-[#0B6B5D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">6 x 3</div>
            </div>

            <div className="col-span-5 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#0B6B5D]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                  <h3 className="font-bold text-slate-900 text-sm">Priority incidents</h3>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-4">Alarms · Latest 24 hours</p>
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2.5 flex justify-between items-center"><span className="font-bold text-slate-800">Restricted area intrusion</span><span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">High</span></div>
                <div className="py-2.5 flex justify-between items-center"><span className="font-bold text-slate-800">Emergency exit opened</span><span className="font-semibold text-slate-600">New</span></div>
                <div className="py-2.5 flex justify-between items-center"><span className="font-bold text-slate-800">Sensor offline</span><span className="font-semibold text-gray-400">Offline</span></div>
              </div>
            </div>

            <div className="col-span-7 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <svg className="w-4 h-4 text-[#0B6B5D]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <h3 className="font-bold text-slate-900 text-sm">Access activity</h3>
              </div>
              <p className="text-xs text-gray-400 mb-6">Access control · Today</p>
              <div className="h-28 w-full">
                <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <path d="M0,80 L70,70 L140,75 L210,60 L280,68 L350,55 L420,58 L500,62" fill="none" stroke="#0B6B5D" strokeWidth="3"/>
                </svg>
              </div>
            </div>

            <div className="col-span-5 border-2 border-dashed border-emerald-300/80 bg-emerald-50/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <p className="text-emerald-800 font-bold text-sm mb-1">+ Drop a tile here</p>
              <p className="text-xs text-emerald-600">Or choose Add tile from the toolbar.</p>
            </div>

          </div>
        </div>

        {currentView === 'edit-dashboard-add-tile' && <AddTileSidePanel onClose={() => setCurrentView('edit-dashboard')} />}
        {currentView === 'edit-dashboard-tile-settings' && <TileSettingsSidePanel onClose={() => setCurrentView('edit-dashboard')} />}
      </div>
    </div>
  );
}

// 2. ADD TILE PANEL
function AddTileSidePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-80 bg-white border border-gray-200 rounded-xl p-5 shadow-xl space-y-4 shrink-0">
      <div className="flex justify-between items-center"><h2 className="text-base font-bold text-slate-900">Add a tile</h2><button onClick={onClose} className="text-gray-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
      <p className="text-xs text-gray-500">Choose a tile and a source you can access.</p>
      <input type="text" placeholder="Search by device or tile type" className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs" />
      <div className="space-y-2">
        <div className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"><span className="text-xs font-bold text-slate-800">Lobby camera</span><button className="px-2.5 py-1 border border-gray-300 rounded text-xs">+ Add</button></div>
        <div className="border border-gray-200 rounded-lg p-3 flex justify-between items-center"><span className="text-xs font-bold text-slate-800">Alarm feed</span><button className="px-2.5 py-1 border border-gray-300 rounded text-xs">+ Add</button></div>
      </div>
      <button onClick={onClose} className="w-full py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold">Done</button>
    </div>
  );
}

// 3. TILE SETTINGS PANEL
function TileSettingsSidePanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-80 bg-white border border-gray-200 rounded-xl p-5 shadow-xl space-y-4 shrink-0">
      <div className="flex justify-between items-center"><h2 className="text-base font-bold text-slate-900">Tile settings</h2><button onClick={onClose} className="text-gray-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
      <div className="space-y-3 text-xs">
        <div><label className="font-bold text-slate-700 block mb-1">Title</label><input type="text" defaultValue="Live cameras" className="w-full px-3 py-1.5 border rounded-md" /></div>
        <div><label className="font-bold text-slate-700 block mb-1">Data source</label><input type="text" defaultValue="Lobby and parking cameras" className="w-full px-3 py-1.5 border rounded-md" /></div>
      </div>
      <div className="flex space-x-3"><button onClick={onClose} className="px-4 py-2 border rounded-md text-xs flex-1">Cancel</button><button onClick={onClose} className="px-4 py-2 bg-[#0B6B5D] text-white rounded-md text-xs flex-1">Apply settings</button></div>
    </div>
  );
}

// 4. ACTIVITY VIEW
function ActivityView({ selectedRecord, setSelectedRecord, setCurrentView }: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Activity</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm">
          <table className="w-full text-left text-xs">
            <thead><tr className="border-b bg-gray-50"><th className="py-2.5 px-3">Name / event</th><th className="py-2.5 px-3">Status / details</th></tr></thead>
            <tbody>
              <tr onClick={() => setSelectedRecord('Loading dock motion')} className="cursor-pointer border-b hover:bg-slate-50"><td className="py-3 px-3 font-bold">Loading dock motion</td><td className="py-3 px-3">High · 09:48</td></tr>
              <tr onClick={() => setSelectedRecord('Lobby camera restored')} className="cursor-pointer border-b hover:bg-slate-50"><td className="py-3 px-3 font-bold">Lobby camera restored</td><td className="py-3 px-3">Resolved · 09:42</td></tr>
            </tbody>
          </table>
        </div>
        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between">
          <div><h3 className="text-lg font-bold text-slate-900">{selectedRecord}</h3><p className="text-xs text-gray-500">High · 09:48</p></div>
          <button onClick={() => setCurrentView('incident-detail')} className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold w-fit">View details</button>
        </div>
      </div>
    </div>
  );
}

// 5. INCIDENT DETAIL
function IncidentDetailView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Incident detail</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-bold">Loading dock motion detected</h2>
          <div className="bg-[#EEF5F3] p-4 rounded-lg"><p className="text-xs font-bold text-slate-800">Related camera: Loading dock</p></div>
          <button className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold">Acknowledge event</button>
        </div>
        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm"><h3 className="font-bold mb-4">Event timeline</h3><p className="text-xs">09:48 · Motion detected</p></div>
      </div>
    </div>
  );
}

// 6. CAMERA DETAIL
function CameraDetailView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Camera detail</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <div className="bg-[#363636] h-64 rounded-lg flex items-center justify-center text-white font-bold text-base">Last frame unavailable</div>
          <h3 className="text-base font-bold">Parking entrance</h3>
        </div>
        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm"><h3 className="font-bold mb-4">Device information</h3><p className="text-xs">Parking entrance · Offline</p></div>
      </div>
    </div>
  );
}

// 7. SENSOR DETAIL
function AlarmSensorDetailView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Alarm and sensor detail</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm"><h2 className="font-bold mb-2">Loading dock motion sensor</h2><p className="text-xs text-gray-500">Online · Zone B</p></div>
        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm"><h3 className="font-bold mb-4">Activity timeline</h3><p className="text-xs">09:48 · Detected</p></div>
      </div>
    </div>
  );
}

// 8. ALARMS VIEW
function AlarmsView({ selectedRecord, setSelectedRecord, setCurrentView }: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Alarms</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm"><p className="text-xs font-bold">Loading dock motion · High</p></div>
        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm"><button onClick={() => setCurrentView('alarm-sensor-detail')} className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs">View details</button></div>
      </div>
    </div>
  );
}

// 9. ACCESS & PARKING VIEW
function AccessParkingView({ selectedRecord, setSelectedRecord }: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900">Access & parking</h1>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm"><p className="text-xs font-bold">West entrance · Badge accepted</p></div>
        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm"><p className="text-xs">Details history</p></div>
      </div>
    </div>
  );
}

// 10. MY VIEWS
function MyViewsView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">USER / MY VIEWS</div>
        <h1 className="text-3xl font-extrabold text-slate-900">My views</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Saved dashboards</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#F8F9F9] border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-56 cursor-pointer hover:border-[#0B6B5D] transition">
            <h3 className="font-bold text-slate-900 text-sm">Control room</h3>
            <div className="bg-[#DCDCDC] h-28 rounded-lg"></div>
            <p className="text-xs text-gray-500">Preview</p>
          </div>
          <div className="bg-[#F8F9F9] border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-56 cursor-pointer hover:border-[#0B6B5D] transition">
            <h3 className="font-bold text-slate-900 text-sm">Alarm response</h3>
            <div className="bg-[#D9EAE4] h-28 rounded-lg"></div>
            <p className="text-xs text-gray-600">Configure tile</p>
          </div>
          <div className="bg-[#F8F9F9] border border-gray-200 rounded-xl p-5 flex flex-col justify-between h-56 cursor-pointer hover:border-[#0B6B5D] transition">
            <h3 className="font-bold text-slate-900 text-sm">New dashboard</h3>
            <div className="bg-[#D9EAE4] h-28 rounded-lg"></div>
            <p className="text-xs text-gray-600">Configure tile</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 11. AI LAYOUT PREVIEW
function AILayoutPreviewView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">NEXUS / USER / AI LAYOUT PREVIEW</div>
        <h1 className="text-3xl font-extrabold text-slate-900">Operations overview</h1>
        <p className="text-xs text-gray-500 mt-0.5">Nexus Headquarters · Control room</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm"><p className="text-xs text-gray-500">Cameras online</p><p className="text-2xl font-bold mt-1">48 / 50</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm"><p className="text-xs text-gray-500">Active alarms</p><p className="text-2xl font-bold mt-1">03</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm"><p className="text-xs text-gray-500">People on site</p><p className="text-2xl font-bold mt-1">1,284</p></div>
        <div className="bg-white p-4 rounded-xl border shadow-sm"><p className="text-xs text-gray-500">Parking available</p><p className="text-2xl font-bold mt-1">64</p></div>
      </div>

      <div className="flex space-x-6 relative">
        <div className="flex-1 bg-white rounded-xl border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm">Live cameras</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#D9EAE4] h-36 rounded-lg p-4 flex items-end font-bold text-xs">Parking entrance</div>
            <div className="bg-[#D9EAE4] h-36 rounded-lg p-4 flex items-end font-bold text-xs">Lobby camera</div>
          </div>
        </div>

        <div className="w-96 bg-white border rounded-xl p-5 shadow-xl space-y-4 shrink-0">
          <h2 className="text-base font-bold">AI layout preview</h2>
          <div>
            <label className="text-xs font-semibold block mb-1">Prompt</label>
            <input type="text" defaultValue="Put active alarms first and show the lobby camera." className="w-full px-3 py-2 border rounded-md text-xs" />
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-gray-50 border rounded-md font-bold">1 Priority incidents</div>
            <div className="p-2.5 bg-gray-50 border rounded-md font-bold">2 Lobby camera</div>
            <div className="p-2.5 bg-gray-50 border rounded-md font-bold">3 Recent activity</div>
          </div>
          <div className="pt-2 flex space-x-3">
            <button className="px-4 py-2 border rounded-md text-xs flex-1">Cancel</button>
            <button className="px-4 py-2 bg-[#0B6B5D] text-white rounded-md text-xs flex-1">Apply layout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 12. DEVICE ACCESS REVOKED
function DeviceAccessRevokedView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">USER / DEVICE ACCESS REVOKED</div>
        <h1 className="text-3xl font-extrabold text-slate-900">Device access revoked</h1>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 bg-white rounded-xl border p-6 shadow-sm space-y-6">
          <h2 className="text-base font-bold">Event and device information</h2>
          <div className="space-y-4 text-xs divide-y">
            <div className="pt-2"><h4 className="font-bold text-sm">Parking camera</h4><p className="text-gray-400">Unavailable</p></div>
            <div className="pt-4"><h4 className="font-bold text-sm">Permission changed</h4><p className="text-gray-500">Contact your site administrator</p></div>
            <div className="pt-4"><h4 className="font-bold text-sm">Dashboard tile</h4><p className="text-gray-500">Choose another camera or remove tile</p></div>
          </div>
        </div>

        <div className="col-span-5 bg-white rounded-xl border p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-4">Activity timeline</h3>
            <div className="space-y-3 text-xs">
              <p className="font-bold">09:48 · Detected</p>
              <p className="font-bold">09:49 · Opened for review</p>
              <p className="font-bold">09:50 · Status updated</p>
            </div>
          </div>
          <button className="px-5 py-2 bg-[#0B6B5D] text-white rounded-md text-xs font-semibold w-fit">Choose another camera</button>
        </div>
      </div>
    </div>
  );
}