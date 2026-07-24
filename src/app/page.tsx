'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { buildings as staticBuildings, zones } from '../data/mapData';
import { BuildingData } from '../data/mapData';
import Sidebar from '../components/Sidebar';
import MapSatellite from '../components/MapSatellite';
import SettingsSidebar from '../components/SettingsSidebar';

const LIVE_STORAGE_KEY = 'mtm_live_buildings';
const BROADCAST_CHANNEL = 'mtm-map-sync';

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeView, setActiveView] = useState<'satellite' | 'layout'>('satellite');

  // Selection states
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  // Hover states
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(null);

  // Auto-pan trigger state for search
  const [searchTarget, setSearchTarget] = useState<{
    type: 'zone' | 'machine';
    id: string;
    zoneId?: string;
  } | null>(null);

  // Floating Settings Sidebar states
  const [showSettingsSidebar, setShowSettingsSidebar] = useState(false);
  const [blueprintOpacity, setBlueprintOpacity] = useState(0.25);
  const [satelliteOpacity, setSatelliteOpacity] = useState(0.8);
  const [shapeOpacity, setShapeOpacity] = useState(0.5);
  const [showGridL2, setShowGridL2] = useState(true);
  const [showRoadsL1, setShowRoadsL1] = useState(true);

  // ── LIVE SYNC STATE ──
  const [liveBuildings, setLiveBuildings] = useState<BuildingData[] | null>(null);
  const [liveInfo, setLiveInfo] = useState<{ count: number; pushedAt: string } | null>(null);
  const [liveFlash, setLiveFlash] = useState(false);

  // The active buildings: live data overrides static data when present
  const activeBuildings: BuildingData[] = liveBuildings ?? staticBuildings;

  const applyLivePayload = useCallback((payload: { buildings: BuildingData[]; pushedAt: string; buildingCount: number }) => {
    setLiveBuildings(payload.buildings as BuildingData[]);
    setLiveInfo({ count: payload.buildingCount, pushedAt: payload.pushedAt });
    setLiveFlash(true);
    setTimeout(() => setLiveFlash(false), 600);
    // Deselect any building that no longer exists
    setSelectedBuildingId(prev => {
      if (prev && !payload.buildings.find((b: BuildingData) => b.id === prev)) return null;
      return prev;
    });
  }, []);

  // On mount: check localStorage for existing live push + setup listeners
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LIVE_STORAGE_KEY);
      if (stored) {
        const payload = JSON.parse(stored);
        if (payload?.buildings?.length) {
          applyLivePayload(payload);
        }
      }
    } catch (_) {
      // ignore
    }

    // Listen to storage events from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== LIVE_STORAGE_KEY || !e.newValue) return;
      try {
        const payload = JSON.parse(e.newValue);
        if (payload?.buildings) applyLivePayload(payload);
      } catch (_) { /* ignore */ }
    };
    window.addEventListener('storage', handleStorage);

    // Listen to BroadcastChannel from same tab (editor.html open in same browser)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === 'LIVE_PUSH' && event.data?.payload?.buildings) {
          applyLivePayload(event.data.payload);
        }
      };
    } catch (_) { /* BroadcastChannel not supported in this browser */ }

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel?.close();
    };
  }, [applyLivePayload]);

  // Load theme preference on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('mtm_map_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (_) {
      // ignore
    }
  }, []);

  const handleToggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('mtm_map_theme', newTheme);
      } catch (_) {}
      return newTheme;
    });
  };

  const resetToStaticData = () => {
    setLiveBuildings(null);
    setLiveInfo(null);
    try { localStorage.removeItem(LIVE_STORAGE_KEY); } catch (_) {}
    setSelectedBuildingId(null);
  };

  const handleSelectBuilding = (id: string) => {
    setSelectedBuildingId(id ? id : null);
    setSelectedZoneId(null);
    setSelectedMachineId(null);
  };

  const handleSelectZone = (id: string) => {
    setSelectedZoneId(id ? id : null);
    setSelectedBuildingId(null);
    setSelectedMachineId(null);
  };

  const handleSelectMachine = (zoneId: string, machineId: string) => {
    setSelectedZoneId(zoneId);
    setSelectedMachineId(machineId ? machineId : null);
    setSelectedBuildingId(null);
  };

  const handleTriggerSearchPan = (type: 'zone' | 'machine', id: string, zoneId?: string) => {
    setSearchTarget({ type, id, zoneId });
  };

  const handleClearSearchTarget = () => {
    setSearchTarget(null);
  };

  // suppress unused warning
  void searchTarget;
  void handleClearSearchTarget;

  const liveTime = liveInfo
    ? new Date(liveInfo.pushedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className={`app-container theme-${theme}`}>
      <div className="app-content-wrapper" style={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden' }}>
        {/* Sleek Interactive Sidebar */}
        <Sidebar
          buildings={activeBuildings}
          zones={zones}
          selectedBuildingId={selectedBuildingId}
          selectedZoneId={selectedZoneId}
          selectedMachineId={selectedMachineId}
          onSelectBuilding={handleSelectBuilding}
          onSelectZone={handleSelectZone}
          onSelectMachine={handleSelectMachine}
          onTriggerSearchPan={handleTriggerSearchPan}
          activeView={activeView}
          setActiveView={setActiveView}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          hoveredBuildingId={hoveredBuildingId}
        />

        {/* Main Workspace */}
        <main className="map-workspace">
          {/* Dynamic Map Layers */}
          <MapSatellite
            buildings={activeBuildings}
            selectedBuildingId={selectedBuildingId}
            onSelectBuilding={handleSelectBuilding}
            hoveredId={hoveredBuildingId}
            setHoveredId={setHoveredBuildingId}
            bgOpacity={satelliteOpacity}
            shapeOpacity={shapeOpacity}
            showRoads={showRoadsL1}
            activeView={activeView}
            onShowSettings={() => setShowSettingsSidebar(true)}
          />
        </main>
      </div>


      {/* Compact Footer Bar for Physical Sizing Specifications */}
      <footer className="app-footer-bar">
        <div className="footer-cell left-cell">
          <span className="footer-icon">📐</span>
          <span>
            {(() => {
              const activeBldId = hoveredBuildingId || selectedBuildingId;
              const selectedBuilding = activeBldId ? activeBuildings.find(b => b.id === activeBldId) : null;
              const selectedZone = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : null;
              const selectedMachine = (selectedZone && selectedMachineId) ? selectedZone.machines.find(m => m.id === selectedMachineId) : null;

              if (selectedMachine) {
                const width = selectedMachine.width ?? 0;
                const height = selectedMachine.height ?? 0;
                const area = (width * height) / 100;
                return `Ukuran Mesin "${selectedMachine.name}": ${width / 10}m x ${height / 10}m (Luas Tapak: ${area} m²)`;
              }
              if (selectedZone) {
                const area = (selectedZone.width * selectedZone.height) / 100;
                return `Ukuran Area/Zona "${selectedZone.name.split(' (')[0]}": ${selectedZone.width / 10}m x ${selectedZone.height / 10}m (Luas Tapak: ${area} m²)`;
              }
              if (selectedBuilding) {
                return `Ukuran Bangunan "${selectedBuilding.name}": ${selectedBuilding.length}m x ${selectedBuilding.width}m (Total Luas Lantai: ${selectedBuilding.area.toLocaleString('id-ID')} m²)`;
              }
              return 'Pilih atau arahkan kursor ke objek (gedung, area, atau mesin) untuk melihat detail dimensi ukuran fisik';
            })()}
          </span>
        </div>
        <div className="footer-cell right-cell">
          {(() => {
            const activeBldId = hoveredBuildingId || selectedBuildingId;
            const selectedBuilding = activeBldId ? activeBuildings.find(b => b.id === activeBldId) : null;
            const selectedZone = selectedZoneId ? zones.find(z => z.id === selectedZoneId) : null;
            const selectedMachine = (selectedZone && selectedMachineId) ? selectedZone.machines.find(m => m.id === selectedMachineId) : null;

            if (selectedMachine) {
              return `Mesin: ${selectedMachine.name} (${selectedMachine.id})`;
            }
            if (selectedZone) {
              return `Area: ${selectedZone.name.split(' (')[0]} (${selectedZone.id})`;
            }
            if (selectedBuilding) {
              const isHovered = hoveredBuildingId === selectedBuilding.id && selectedBuildingId !== selectedBuilding.id;
              return `${isHovered ? 'Sorotan: ' : 'Gedung: '}${selectedBuilding.name} (${selectedBuilding.code})`;
            }
            return 'PT Menara Terus Makmur';
          })()}
        </div>
      </footer>

      {/* Floating Right Settings Drawer */}
      <SettingsSidebar
        isOpen={showSettingsSidebar}
        onClose={() => setShowSettingsSidebar(false)}
        blueprintOpacity={blueprintOpacity}
        onBlueprintOpacityChange={setBlueprintOpacity}
        satelliteOpacity={satelliteOpacity}
        onSatelliteOpacityChange={setSatelliteOpacity}
        shapeOpacity={shapeOpacity}
        onShapeOpacityChange={setShapeOpacity}
        showGrid={showGridL2}
        onShowGridChange={setShowGridL2}
        showRoads={showRoadsL1}
        onShowRoadsChange={setShowRoadsL1}
      />
    </div>
  );
}
