'use client';

import React, { useMemo } from 'react';
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
}: SidebarProps) {
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
        <div className="brand-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446l6.002-3.461c.496-.286.8-.813.8-1.385V6.243c0-.572-.304-1.1-.8-1.385L15.503 1.397a1.607 1.607 0 00-1.606 0L7.899 4.858a1.607 1.607 0 00-.8 1.385v9.117c0 .572.304 1.1.8 1.385l6.002 3.461a1.607 1.607 0 001.606 0z" />
          </svg>
          <span className="brand-name">PT MTM MAPS</span>
        </div>
        <p className="brand-tagline">Sistem Informasi Tata Letak & Alur Produksi</p>
      </div>

      {/* Info Details & Lists */}
      <div className="sidebar-content">
        {!selectedBuildingId && !selectedZoneId ? (
          /* Default Directory View */
          <div className="directory-view">
            <h3 style={{ margin: '15px 0 10px 0', fontSize: '14px', color: '#a1a1aa' }}>Daftar Gedung & Area</h3>
            
            <div className="tab-content">
              <div className="list-group">
                <div style={{ padding: '4px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a' }}>Gedung</div>
                {buildings.map((bld) => (
                  <div
                    key={bld.id}
                    className="list-item"
                    style={{ cursor: 'default' }}
                  >
                    <div className="item-header">
                      <span className="item-title">{bld.name}</span>
                      <span className="item-badge">{bld.code.split(' ')[0]}</span>
                    </div>
                    <div className="item-footer">
                      <span>Panjang: {bld.length}m, Lebar: {bld.width}m</span>
                      <span className="item-status text-emerald">{bld.operationalStatus}</span>
                    </div>
                  </div>
                ))}

                <div style={{ padding: '16px 0 4px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#71717a' }}>Area / Zone</div>
                {zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="list-item"
                    style={{ cursor: 'default' }}
                  >
                    <div className="item-header">
                      <span className="item-title">{zone.name.split(' (')[0]}</span>
                      <span className="item-badge outline">{zone.id}</span>
                    </div>
                    <div className="item-footer">
                      <span>Dimensi: {zone.width / 10}m x {zone.height / 10}m</span>
                      <span className="text-zinc-400">{zone.machines.length} Mesin</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedMachine ? (
          /* Machine Detail Panel */
          <div className="detail-panel machine-details">
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
                {selectedMachine.width && selectedMachine.height && (
                  <div className="info-cell col-2">
                    <span className="info-label">Ukuran Area Mesin</span>
                    <span className="info-value">
                      {selectedMachine.width / 10}m x {selectedMachine.height / 10}m ({ (selectedMachine.width * selectedMachine.height) / 100 } m²)
                    </span>
                  </div>
                )}
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

            <div className="detail-card">
              <h3>Dimensi Fisik</h3>
              <div className="info-grid">
                <div className="info-cell">
                  <span className="info-label">Lebar Real</span>
                  <span className="info-value">{selectedZone.width / 10} Meter</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Panjang Real</span>
                  <span className="info-value">{selectedZone.height / 10} Meter</span>
                </div>
                <div className="info-cell col-2">
                  <span className="info-label">Luas Tapak Area</span>
                  <span className="info-value">
                    {(selectedZone.width * selectedZone.height) / 100} m²
                  </span>
                </div>
              </div>
            </div>

            {selectedZone.machines.length > 0 && (
              <div className="detail-card list-section">
                <h3>Mesin & Stasiun Kerja ({selectedZone.machines.length})</h3>
                <div className="mini-list-group">
                  {selectedZone.machines.map((mach) => (
                    <div
                      key={mach.id}
                      className="mini-list-item"
                      style={{ cursor: 'default' }}
                    >
                      <div className="mini-item-left">
                        <span className={`status-dot ${mach.status}`} />
                        <span className="mini-item-name">{mach.name}</span>
                      </div>
                      <div className="mini-item-right">
                        <span className="mini-item-eff">{mach.efficiency}% OEE</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : selectedBuilding ? (
          /* Building Detail Panel */
          <div className="detail-panel building-details">
            <div className="detail-header">
              <h2>{selectedBuilding.name}</h2>
              <p className="detail-subtitle">{selectedBuilding.code}</p>
            </div>

            <div className="detail-card">
              <h3>Spesifikasi Fisik Bangunan</h3>
              <div className="info-grid">
                <div className="info-cell">
                  <span className="info-label">Panjang</span>
                  <span className="info-value">{selectedBuilding.length} Meter</span>
                </div>
                <div className="info-cell">
                  <span className="info-label">Lebar</span>
                  <span className="info-value">{selectedBuilding.width} Meter</span>
                </div>
                <div className="info-cell col-2">
                  <span className="info-label font-bold">Total Luas Lantai</span>
                  <span className="info-value text-xl font-bold text-emerald-400">
                    {selectedBuilding.area.toLocaleString('id-ID')} m²
                  </span>
                </div>
                <div className="info-cell col-2">
                  <span className="info-label">Status Operasional</span>
                  <span className="info-value text-emerald-400">{selectedBuilding.operationalStatus}</span>
                </div>
              </div>
            </div>

            <div className="detail-card">
              <h3>Fungsi Utama</h3>
              <p className="detail-paragraph">{selectedBuilding.details}</p>
            </div>

            {selectedBuilding.zones.length > 0 && (
              <div className="detail-card list-section">
                <h3>Area Internal di Dalam Gedung</h3>
                <div className="mini-list-group">
                  {selectedBuilding.zones.map((zoneId) => {
                    const matchedZone = zones.find((z) => z.id === zoneId);
                    if (!matchedZone) return null;
                    return (
                      <div
                        key={zoneId}
                        className="mini-list-item"
                        style={{ cursor: 'default' }}
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
