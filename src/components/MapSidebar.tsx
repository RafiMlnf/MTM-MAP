'use client';

import React from 'react';
import { BuildingData, ZoneData } from '../data/mapData';

interface MapSidebarProps {
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
  hoveredBuildingId: string | null;
}

export default function MapSidebar({
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
  hoveredBuildingId,
}: MapSidebarProps) {
  // Safe suppression for unused props to avoid TS compile errors
  React.useEffect(() => {
    const dummy = () => {
      onSelectBuilding('');
      onSelectZone('');
      onSelectMachine('', '');
      onTriggerSearchPan('zone', '');
      setActiveView(activeView);
      onToggleTheme();
      void theme;
      void hoveredBuildingId;
    };
    if (false) dummy();
  }, [onSelectBuilding, onSelectZone, onSelectMachine, onTriggerSearchPan, activeView, setActiveView, onToggleTheme, theme, hoveredBuildingId]);

  return (
    <aside 
      className="sidebar-container" 
      style={{ 
        position: 'relative',
        width: '250px',
        height: '100%',
        backgroundColor: 'var(--bg-main)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        borderRadius: '0px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        flexShrink: 0,
      }}
    >
      {/* Compact Content Area */}
      <div className="sidebar-content" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        
        {/* Dashboard Quick Stats Widget */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '0px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)' }}>{buildings.length}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Gedung</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '17px', fontWeight: 'bold', color: 'var(--text-main)' }}>{zones.length}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Zona Aktif</span>
            </div>
          </div>
        </div>

        {/* Quick Access Area Grid (3xX) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>
            Akses Cepat Area
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { 
                label: 'OFFICE', 
                id: 'bld-office', 
                code: 'OFC',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '3px' }}>
                    <path d="M3 21h18M3 7v14M21 7v14M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2zM9 11h2v2H9zm0 4h2v2H9zm4-4h2v2h-2zm0 4h2v2h-2z"/>
                  </svg>
                )
              },
              { 
                label: 'PRODUKSI 1', 
                id: 'bld-dies', 
                code: 'PRD 1',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '3px' }}>
                    <path d="M2 20V9l7 5 7-5 6 4v7H2zM14 20v-4M10 20v-4"/>
                  </svg>
                )
              },
              { 
                label: 'PRODUKSI 2', 
                id: 'bld-production-2', 
                code: 'PRD 2',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '3px' }}>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                )
              },
              { 
                label: 'FORGING', 
                id: 'bld-forging', 
                code: 'FRG',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '3px' }}>
                    <path d="M22 6.5L17.5 2 9 10.5l-3-3L2 11.5l5.5 5.5L11 13.5l-3-3 8.5-8.5zM2 22l6-6"/>
                  </svg>
                )
              },
              { 
                label: 'ADM DELIVERY', 
                id: 'bld-admin-delivery', 
                code: 'DEL',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '3px' }}>
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2"/>
                    <path d="M16 8h4l3 3v5h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                )
              },
              { 
                label: 'MAINTENANCE', 
                id: 'bld-maintenance', 
                code: 'MNT',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '3px' }}>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                  </svg>
                )
              },
              { 
                label: 'PACKAGING', 
                id: 'bld-packaging', 
                code: 'PKG',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginBottom: '3px' }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
                  </svg>
                )
              },
            ].map((item, idx) => {
              const isSelected = selectedBuildingId === item.id;
              return (
                <button
                  key={`${item.id}-${idx}`}
                  onClick={() => onSelectBuilding(isSelected ? '' : item.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 4px',
                    borderRadius: '0px',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-card)',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    boxShadow: isSelected ? '0 0 0 1px var(--primary)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                    minHeight: '58px',
                  }}
                  title={item.label}
                >
                  <span style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)', display: 'flex' }}>
                    {item.icon}
                  </span>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    marginBottom: '1px'
                  }}>
                    {item.code}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Dynamic Context Floating Banner (If anything is selected) */}
      {(selectedBuildingId || selectedZoneId || selectedMachineId) && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-main)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          borderTop: '1.5px solid var(--primary)',
          borderRadius: '0px',
          padding: '10px 12px',
          animation: 'fadeIn 0.2s ease-out',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          zIndex: 19,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '9.5px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>
              Objek Terpilih
            </span>
            <button 
              onClick={() => { onSelectBuilding(''); onSelectZone(''); onSelectMachine('', ''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '11px', padding: '0 4px' }}
              title="Batal Seleksi"
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 'bold' }}>
            {selectedBuildingId && `${buildings.find(b => b.id === selectedBuildingId)?.name || selectedBuildingId}`}
            {selectedZoneId && `Zona: ${selectedZoneId}`}
            {selectedMachineId && `Mesin: ${selectedMachineId}`}
          </div>
        </div>
      )}

    </aside>
  );
}
