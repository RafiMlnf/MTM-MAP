'use client';

import React, { useMemo, useState } from 'react';
import { BuildingData, ZoneData } from '../data/mapData';

interface SidebarProps {
  buildings: BuildingData[];
  zones: ZoneData[];
  selectedBuildingId: string | null;
  selectedZoneId: string | null;
  selectedMachineId: string | null;
  onSelectBuilding: (id: string) => void;
  onSelectZone: (id: string) => void;
  onSelectMachine: (zoneId: string, machineId: string) => void;
  onTriggerSearchPan: (type: 'zone' | 'machine', id: string, zoneId?: string) => void;
  activeView: 'satellite' | 'layout';
  setActiveView: (view: 'satellite' | 'layout') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Sidebar({
  buildings,
  zones,
  selectedBuildingId,
  selectedZoneId,
  selectedMachineId,
  onSelectBuilding,
  onSelectZone,
  onSelectMachine,
  onTriggerSearchPan,
  activeView,
  setActiveView,
  theme,
  onToggleTheme,
}: SidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState({
    gedung: false,
    taman: false,
    zone: false,
  });

  const toggleGroup = (group: 'gedung' | 'taman' | 'zone') => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  // Find the currently selected objects
  const selectedBuilding = useMemo(() => {
    return buildings.find((b) => b.id === selectedBuildingId) || null;
  }, [buildings, selectedBuildingId]);

  const selectedZone = useMemo(() => {
    return zones.find((z) => z.id === selectedZoneId) || null;
  }, [zones, selectedZoneId]);

  const selectedMachine = useMemo(() => {
    if (!selectedZone || !selectedMachineId) return null;
    return selectedZone.machines.find((m) => m.id === selectedMachineId) || null;
  }, [selectedZone, selectedMachineId]);

  const mainBuildings = useMemo(() => {
    return buildings
      .filter(b => !b.id.toLowerCase().includes('taman') && !b.name.toLowerCase().includes('taman'))
      .sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
  }, [buildings]);

  const gardenBuildings = useMemo(() => {
    return buildings
      .filter(b => b.id.toLowerCase().includes('taman') || b.name.toLowerCase().includes('taman'))
      .sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
  }, [buildings]);

  const sortedZones = useMemo(() => {
    return [...zones].sort((a, b) => a.name.localeCompare(b.name, 'id-ID'));
  }, [zones]);

  // Calculations for selected zone
  const zoneStats = useMemo(() => {
    if (!selectedZone) return null;
    const machinesCount = selectedZone.machines.length;
    if (machinesCount === 0) return { avgEfficiency: 0, running: 0, idle: 0, maintenance: 0 };

    const running = selectedZone.machines.filter((m) => m.status === 'running').length;
    const idle = selectedZone.machines.filter((m) => m.status === 'idle').length;
    const maintenance = selectedZone.machines.filter((m) => m.status === 'maintenance').length;
    const avgEfficiency = Math.round(
      selectedZone.machines.reduce((acc, m) => acc + m.efficiency, 0) / machinesCount
    );

    return { avgEfficiency, running, idle, maintenance };
  }, [selectedZone]);

  // Reference all unused props/callbacks to avoid any potential strict TS compilation errors
  React.useEffect(() => {
    if (false) {
      onSelectBuilding('');
      onSelectZone('');
      onSelectMachine('', '');
      onTriggerSearchPan('zone', '');
      setActiveView(activeView);
    }
  }, [onSelectBuilding, onSelectZone, onSelectMachine, onTriggerSearchPan, activeView, setActiveView]);

  return (
    <aside className="sidebar-container">
      {/* Brand logo & header */}
      <div className="sidebar-header">
        <div className="brand-wrapper" style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '170px', boxSizing: 'border-box' }}>
          <img 
            src="/assets/img/mtmwide.png" 
            alt="PT MTM Logo" 
            style={{ width: '100%', height: 'auto', maxHeight: '32px', objectFit: 'contain' }} 
          />
        </div>
        <button className="theme-toggle-btn" onClick={onToggleTheme} title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}>
          {theme === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      {/* Layer selector */}
      <div className="view-mode-toggle">
        <button
          className={`toggle-btn ${activeView === 'satellite' ? 'active' : ''}`}
          onClick={() => setActiveView('satellite')}
        >
          Gedung Utama
        </button>
        <button
          className={`toggle-btn ${activeView === 'layout' ? 'active' : ''}`}
          onClick={() => setActiveView('layout')}
        >
          Dalam Gedung
        </button>
      </div>

      {/* Info Details & Lists */}
      <div className="sidebar-content">
        {!selectedBuildingId && !selectedZoneId ? (
          /* Default Directory View */
          <div className="directory-view">
            <h3 style={{ margin: '15px 0 10px 0', fontSize: '14px', color: '#a1a1aa' }}>Daftar Gedung & Area</h3>
            
            <div className="tab-content">
              <div className="list-group">
                {/* Gedung Utama Header */}
                <div
                  onClick={() => toggleGroup('gedung')}
                  className="list-group-header"
                  style={{
                    padding: '8px 4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    userSelect: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '4px'
                  }}
                >
                  <span style={{
                    fontSize: '8px',
                    display: 'inline-block',
                    transform: expandedGroups.gedung ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease'
                  }}>▶</span>
                  Gedung Utama ({mainBuildings.length})
                </div>
                {expandedGroups.gedung && mainBuildings.map((bld, idx) => {
                  const isSelected = selectedBuildingId === bld.id;
                  return (
                    <div
                      key={`main-bld-${bld.id}-${idx}`}
                      className={`list-item clickable ${isSelected ? 'selected-item' : ''}`}
                      onClick={() => onSelectBuilding(bld.id)}
                      style={{ paddingLeft: '20px' }}
                    >
                      <div className="item-header" style={{ width: '100%' }}>
                        <span className="item-title">{bld.name}</span>
                        <span className="item-badge">{bld.code.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Taman Header */}
                <div
                  onClick={() => toggleGroup('taman')}
                  className="list-group-header"
                  style={{
                    padding: '8px 4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    userSelect: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    marginTop: '12px',
                    marginBottom: '4px'
                  }}
                >
                  <span style={{
                    fontSize: '8px',
                    display: 'inline-block',
                    transform: expandedGroups.taman ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease'
                  }}>▶</span>
                  Taman ({gardenBuildings.length})
                </div>
                {expandedGroups.taman && gardenBuildings.map((bld, idx) => {
                  const isSelected = selectedBuildingId === bld.id;
                  return (
                    <div
                      key={`garden-bld-${bld.id}-${idx}`}
                      className={`list-item clickable ${isSelected ? 'selected-item' : ''}`}
                      onClick={() => onSelectBuilding(bld.id)}
                      style={{ paddingLeft: '20px' }}
                    >
                      <div className="item-header" style={{ width: '100%' }}>
                        <span className="item-title">{bld.name}</span>
                        <span className="item-badge outline">{bld.code.split(' ')[0]}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Area / Zone Header */}
                <div
                  onClick={() => toggleGroup('zone')}
                  className="list-group-header"
                  style={{
                    padding: '8px 4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#71717a',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    userSelect: 'none',
                    borderBottom: '1px solid var(--border-color)',
                    marginTop: '12px',
                    marginBottom: '4px'
                  }}
                >
                  <span style={{
                    fontSize: '8px',
                    display: 'inline-block',
                    transform: expandedGroups.zone ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.15s ease'
                  }}>▶</span>
                  Area / Zone ({zones.length})
                </div>
                {expandedGroups.zone && sortedZones.map((zone, idx) => {
                  const isSelected = selectedZoneId === zone.id;
                  return (
                    <div
                      key={`zone-${zone.id}-${idx}`}
                      className={`list-item clickable ${isSelected ? 'selected-item' : ''}`}
                      onClick={() => onSelectZone(zone.id)}
                      style={{ paddingLeft: '20px' }}
                    >
                      <div className="item-header" style={{ width: '100%' }}>
                        <span className="item-title">{zone.name.split(' (')[0]}</span>
                        <span className="item-badge outline">{zone.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : selectedMachine ? (
          /* Machine Detail Panel */
          <div className="detail-panel machine-details">
            <button className="back-btn" onClick={() => onSelectMachine(selectedZone!.id, '')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Kembali ke {selectedZone!.name.split(' (')[0]}
            </button>
            <div className="detail-header">
              <div className="header-title-row">
                <h2>Mesin {selectedMachine.name}</h2>
                <span className={`status-badge-pill ${selectedMachine.status}`}>
                  {selectedMachine.status.toUpperCase()}
                </span>
              </div>
              <p className="detail-subtitle">ID Stasiun: {selectedMachine.id} | Area: {selectedZone!.name.split(' (')[0]}</p>
            </div>

            {/* Efficiency Circular Meter */}
            <div className="gauge-section">
              <div className="gauge-container">
                <svg viewBox="0 0 100 100" className="gauge-svg">
                  <circle cx="50" cy="50" r="40" className="gauge-bg-circle" />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    className="gauge-val-circle"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 40}`,
                      strokeDashoffset: `${2 * Math.PI * 40 * (1 - selectedMachine.efficiency / 100)}`,
                    }}
                  />
                  <text x="50" y="55" className="gauge-text">
                    {selectedMachine.efficiency}%
                  </text>
                </svg>
              </div>
              <div className="gauge-meta">
                <span className="gauge-label">Efisiensi OEE</span>
                <span className="gauge-val-desc">
                  {selectedMachine.efficiency > 90
                    ? 'Sangat Optimal'
                    : selectedMachine.efficiency > 80
                    ? 'Normal'
                    : selectedMachine.efficiency > 0
                    ? 'Perlu Perhatian'
                    : 'Tidak Beroperasi'}
                </span>
              </div>
            </div>

            <div className="detail-card">
              <h3>Informasi Operasional</h3>
              <div className="info-grid">
                <div className="info-cell">
                  <span className="info-label">Operator</span>
                  <span className="info-value">{selectedMachine.operator}</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Tipe Stasiun</span>
                  <span className="info-value text-capitalize">{selectedMachine.type}</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Fungsi & Detail Teknis</h3>
              <p className="detail-paragraph">{selectedMachine.details}</p>
            </div>
          </div>
        ) : selectedZone ? (
          /* Zone Detail Panel */
          <div className="detail-panel zone-details">
            <button className="back-btn" onClick={() => onSelectZone('')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Kembali ke Daftar
            </button>
            <div className="detail-header">
              <h2>{selectedZone.name}</h2>
              <p className="detail-subtitle">Kode: {selectedZone.id}</p>
            </div>

            {zoneStats && (
              <div className="zone-dashboard-grid">
                <div className="stat-card inline text-center">
                  <span className="stat-val text-primary">{zoneStats.avgEfficiency}%</span>
                  <span className="stat-label">Rata-rata OEE</span>
                </div>
                <div className="stat-sub-grid">
                  <div className="stat-mini-badge running">
                    <span>{zoneStats.running} Active</span>
                  </div>
                  <div className="stat-mini-badge idle">
                    <span>{zoneStats.idle} Idle</span>
                  </div>
                  <div className="stat-mini-badge maintenance">
                    <span>{zoneStats.maintenance} Repair</span>
                  </div>
                </div>
              </div>
            )}

            <div className="detail-card">
              <h3>Deskripsi Area</h3>
              <p className="detail-paragraph">{selectedZone.details}</p>
            </div>

            {selectedZone.machines.length > 0 && (
              <div className="detail-card list-section">
                <h3>Mesin & Stasiun Kerja ({selectedZone.machines.length})</h3>
                <div className="mini-list-group">
                  {selectedZone.machines.map((mach, idx) => {
                    const isSelected = selectedMachineId === mach.id;
                    return (
                      <div
                        key={`${mach.id}-${idx}`}
                        className={`mini-list-item clickable ${isSelected ? 'selected-item' : ''}`}
                        onClick={() => onSelectMachine(selectedZone.id, mach.id)}
                      >
                        <div className="mini-item-left">
                          <span className={`status-dot ${mach.status}`} />
                          <span className="mini-item-name">{mach.name}</span>
                        </div>
                        <div className="mini-item-right">
                          <span className="mini-item-eff">{mach.efficiency}% OEE</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : selectedBuilding ? (
          /* Building Detail Panel */
          <div className="detail-panel building-details">
            <button className="back-btn" onClick={() => onSelectBuilding('')}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Kembali ke Daftar
            </button>
            <div className="detail-header">
              <h2>{selectedBuilding.name}</h2>
              <p className="detail-subtitle">{selectedBuilding.code} • <span className="text-emerald-400">{selectedBuilding.operationalStatus}</span></p>
            </div>

            <div className="detail-card">
              <h3>Fungsi Utama</h3>
              <p className="detail-paragraph">{selectedBuilding.details}</p>
            </div>

            {selectedBuilding.zones.length > 0 && (
              <div className="detail-card list-section">
                <h3>Area Internal di Dalam Gedung</h3>
                <div className="mini-list-group">
                  {selectedBuilding.zones.map((zoneId, idx) => {
                    const matchedZone = zones.find((z) => z.id === zoneId);
                    if (!matchedZone) return null;
                    return (
                      <div
                        key={`${zoneId}-${idx}`}
                        className="mini-list-item clickable"
                        onClick={() => onSelectZone(zoneId)}
                      >
                        <div className="mini-item-left">
                          <span className="mini-item-name">{matchedZone.name.split(' (')[0]}</span>
                        </div>
                        <div className="mini-item-right">
                          <span className="text-zinc-500 text-xs">{(matchedZone.width * matchedZone.height) / 100} m²</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
