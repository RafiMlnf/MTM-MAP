'use client';

import React, { useState } from 'react';
import { buildings, zones } from '../data/mapData';
import Sidebar from '../components/Sidebar';
import MapSatellite from '../components/MapSatellite';
import SettingsSidebar from '../components/SettingsSidebar';

export default function Home() {
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

  return (
    <div className="app-container">
      {/* Sleek Interactive Sidebar */}
      <Sidebar
        buildings={buildings}
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
      />

      {/* Main Workspace */}
      <main className="map-workspace">
        {/* Floating Settings Gear Button */}
        <button
          onClick={() => setShowSettingsSidebar(true)}
          className="floating-settings-btn"
          title="Buka Pengaturan"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
          </svg>
        </button>

        {/* Dynamic Map Layers */}
        <MapSatellite
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={handleSelectBuilding}
          hoveredId={hoveredBuildingId}
          setHoveredId={setHoveredBuildingId}
          bgOpacity={satelliteOpacity}
          shapeOpacity={shapeOpacity}
          showRoads={showRoadsL1}
        />
      </main>

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
