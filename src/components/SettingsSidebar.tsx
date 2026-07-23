'use client';

import React from 'react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  blueprintOpacity: number;
  onBlueprintOpacityChange: (val: number) => void;
  satelliteOpacity: number;
  onSatelliteOpacityChange: (val: number) => void;
  shapeOpacity: number;
  onShapeOpacityChange: (val: number) => void;
  showGrid: boolean;
  onShowGridChange: (val: boolean) => void;
  showRoads: boolean;
  onShowRoadsChange: (val: boolean) => void;
}

export default function SettingsSidebar({
  isOpen,
  onClose,
  satelliteOpacity,
  onSatelliteOpacityChange,
  shapeOpacity,
  onShapeOpacityChange,
}: SettingsSidebarProps) {
  if (!isOpen) return null;

  return (
    <div 
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: '12px',
        right: '60px',
        width: '210px',
        background: 'var(--bg-main)',
        border: '1px solid var(--border-color)',
        borderRadius: '0px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.15s ease-out',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '10px 12px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--header-bg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
          </svg>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '0.5px' }}>KECERAHAN PETA</span>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 0 }}
          title="Tutup"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* L1 Satelit Opacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-main)' }}>
            <span>Kecerahan Peta Utama:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{Math.round(satelliteOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={satelliteOpacity}
            onChange={(e) => onSatelliteOpacityChange(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Shape Opacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-main)' }}>
            <span>Garis Area (Shape):</span>
            <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{Math.round(shapeOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={shapeOpacity}
            onChange={(e) => onShapeOpacityChange(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>
    </div>
  );
}
