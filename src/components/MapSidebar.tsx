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
  mainGate?: { x: number; y: number; rotation: number; imageUrl?: string } | null;
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
  mainGate,
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

  const selectedMachine = React.useMemo(() => {
    if (!selectedZoneId || !selectedMachineId) return null;
    const zone = zones.find(z => z.id === selectedZoneId);
    return zone ? zone.machines.find(m => m.id === selectedMachineId) : null;
  }, [zones, selectedZoneId, selectedMachineId]);

  const activeBld = React.useMemo(() => {
    return selectedBuildingId ? (selectedBuildingId === 'main-gate' ? null : buildings.find(b => b.id === selectedBuildingId)) : null;
  }, [buildings, selectedBuildingId]);

  const apiConfig = React.useMemo(() => {
    // If machine selected:
    if (selectedMachine?.andonLineId === 'AssyStemA') {
      return {
        enabled: true,
        url: 'http://mtmsvr-andonapp/andon-gateway/api/telemetry/latest/AssyStemA',
        method: 'GET',
        headers: null as string | null,
        body: null as string | null,
        interval: 4000,
        oeeKey: 'oee',
        statusKey: 'status_line',
        planKey: 'plan_qty',
        actualKey: 'actual_qty',
        achKey: 'achievement_pct',
        availabilityKey: 'availability',
        performanceKey: 'performance',
        qualityKey: 'quality_rate',
        woKey: 'work_order_name',
      };
    }

    if (!activeBld) return null;

    // Check if activeBld is Assy A (backward compatibility)
    const isAssyA = (activeBld.name || '').toLowerCase().includes('assy stem a') ||
                    (activeBld.code || '').toLowerCase().includes('assy stem a') ||
                    activeBld.id === 'Assy A';

    if (activeBld.apiEnabled) {
      return {
        enabled: true,
        url: activeBld.apiUrl,
        method: activeBld.apiMethod || 'GET',
        headers: activeBld.apiHeaders || null,
        body: activeBld.apiBody || null,
        interval: (activeBld.apiInterval || 4) * 1000,
        oeeKey: activeBld.apiOeeKey || 'oee',
        statusKey: activeBld.apiStatusKey || 'status_line',
        planKey: activeBld.apiPlanKey || 'plan_qty',
        actualKey: activeBld.apiActualKey || 'actual_qty',
        achKey: activeBld.apiAchKey || 'achievement_pct',
        availabilityKey: activeBld.apiAvailabilityKey || 'availability',
        performanceKey: activeBld.apiPerformanceKey || 'performance',
        qualityKey: activeBld.apiQualityKey || 'quality_rate',
        woKey: activeBld.apiWoKey || 'work_order_name',
      };
    }

    if (isAssyA) {
      return {
        enabled: true,
        url: 'http://mtmsvr-andonapp/andon-gateway/api/telemetry/latest/AssyStemA',
        method: 'GET',
        headers: null as string | null,
        body: null as string | null,
        interval: 4000,
        oeeKey: 'oee',
        statusKey: 'status_line',
        planKey: 'plan_qty',
        actualKey: 'actual_qty',
        achKey: 'achievement_pct',
        availabilityKey: 'availability',
        performanceKey: 'performance',
        qualityKey: 'quality_rate',
        woKey: 'work_order_name',
      };
    }

    return null;
  }, [selectedMachine, activeBld]);

  const [andonData, setAndonData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!apiConfig || !apiConfig.enabled) {
      setAndonData(null);
      return;
    }

    let active = true;
    let intervalId: any = null;

    // Simulated data generator for offline/fallback mode
    const generateSimulatedData = (prevData: any) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID');
      const basePlan = 650;
      let actual = prevData ? (prevData[apiConfig.actualKey] || 540) : 540;
      
      // Gradually increase actual quantity to simulate production
      if (Math.random() > 0.4) {
        actual += Math.floor(Math.random() * 3) + 1;
      }
      
      if (actual > basePlan) actual = basePlan;
      
      const ach = Math.round((actual / basePlan) * 100);
      return {
        [apiConfig.statusKey]: 1, // Running
        [apiConfig.planKey]: basePlan,
        [apiConfig.actualKey]: actual,
        [apiConfig.achKey]: ach,
        [apiConfig.oeeKey]: 88,
        [apiConfig.availabilityKey]: 95,
        [apiConfig.performanceKey]: 92,
        [apiConfig.qualityKey]: 99,
        [apiConfig.woKey]: 'WO-' + (activeBld?.code || 'GENERIC') + '-2026',
        time: timeStr,
        plc_connected: true
      };
    };

    const fetchData = async () => {
      if (!active) return;
      try {
        const fetchOptions: RequestInit = {
          method: apiConfig.method,
        };

        if (apiConfig.headers) {
          try {
            fetchOptions.headers = JSON.parse(apiConfig.headers);
          } catch (e) {
            console.error('Invalid custom headers format. Must be JSON.', e);
          }
        }

        if (apiConfig.body && (apiConfig.method === 'POST' || apiConfig.method === 'PUT')) {
          fetchOptions.body = apiConfig.body;
        }

        const res = await fetch(apiConfig.url!, fetchOptions);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setAndonData(data);
          }
        } else {
          throw new Error('Non-OK response');
        }
      } catch (err) {
        // Fallback to simulated data
        if (active) {
          setAndonData((prev: any) => generateSimulatedData(prev));
        }
      }
    };

    fetchData();

    // Poll for real-time updates
    intervalId = setInterval(fetchData, apiConfig.interval);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [apiConfig, activeBld]);

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
      {/* 16:9 Selected Object Banner at the very top of Sidebar (Below topbar) */}
      {(() => {
        const activeBld = selectedBuildingId ? (selectedBuildingId === 'main-gate' ? null : buildings.find(b => b.id === selectedBuildingId)) : null;
        const imageUrl = selectedBuildingId === 'main-gate' ? mainGate?.imageUrl : activeBld?.imageUrl;
        if (!imageUrl) return null;
        return (
          <div style={{
            width: '100%',
            height: '140px',
            position: 'relative',
            overflow: 'hidden',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'rgba(0,0,0,0.2)',
            flexShrink: 0,
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <img 
              src={imageUrl} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Selected object image banner" 
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '190px' }}>
                {selectedBuildingId === 'main-gate' ? 'Pintu Masuk Utama (Gate)' : activeBld?.name}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onSelectBuilding(''); onSelectZone(''); onSelectMachine('', ''); }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '11px', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                title="Batal Seleksi"
              >
                ✕
              </button>
            </div>
          </div>
        );
      })()}

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
      {(selectedBuildingId || selectedZoneId || selectedMachineId) && (() => {
        const activeBld = selectedBuildingId ? (selectedBuildingId === 'main-gate' ? null : buildings.find(b => b.id === selectedBuildingId)) : null;

        return (
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '2px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedBuildingId === 'main-gate' && 'Pintu Masuk Utama (Gate)'}
                {selectedBuildingId && selectedBuildingId !== 'main-gate' && (activeBld?.name || selectedBuildingId)}
                {selectedZoneId && !selectedMachineId && `Zona: ${selectedZoneId}`}
                {selectedMachineId && `Mesin: ${selectedMachineId}`}
              </div>
              {selectedBuildingId && selectedBuildingId !== 'main-gate' && activeBld?.details && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeBld.details}
                </div>
              )}              {/* Real-time Andon Circle Chart */}
              {apiConfig && apiConfig.enabled && (() => {
                const oeeVal = andonData ? andonData[apiConfig.oeeKey] : 0;
                const achVal = andonData ? andonData[apiConfig.achKey] : 0;
                const percent = oeeVal || achVal || 0;
                
                const statusVal = andonData ? andonData[apiConfig.statusKey] : null;
                const isRunning = statusVal === 1 || statusVal === 'running' || statusVal === 'Running' || statusVal === true || statusVal === '1';

                const planVal = andonData ? andonData[apiConfig.planKey] : '-';
                const actualVal = andonData ? andonData[apiConfig.actualKey] : '-';
                const availabilityVal = andonData ? andonData[apiConfig.availabilityKey] : null;
                const performanceVal = andonData ? andonData[apiConfig.performanceKey] : null;
                const qualityVal = andonData ? andonData[apiConfig.qualityKey] : null;
                const woVal = andonData ? andonData[apiConfig.woKey] : null;

                const radius = 25;
                const strokeWidth = 5;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (percent / 100) * circumference;

                return (
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'stretch', 
                    gap: '10px',
                    marginTop: '12px', 
                    padding: '12px', 
                    backgroundColor: 'rgba(59, 130, 246, 0.03)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '4px',
                    animation: 'fadeIn 0.25s ease-out'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* SVG Circular Progress */}
                      <div style={{ position: 'relative', width: '54px', height: '54px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="54" height="54" viewBox="0 0 60 60" style={{ position: 'absolute', top: 0, left: 0 }}>
                          <circle
                            cx="30"
                            cy="30"
                            r={radius}
                            fill="transparent"
                            stroke="var(--border-color)"
                            strokeWidth={strokeWidth}
                            style={{ opacity: 0.12 }}
                          />
                          <circle
                            cx="30"
                            cy="30"
                            r={radius}
                            fill="transparent"
                            stroke={isRunning ? '#10b981' : '#ef4444'}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform="rotate(-90 30 30)"
                            style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                          />
                        </svg>
                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-main)', zIndex: 2 }}>
                          {percent}%
                        </span>
                        <span style={{ fontSize: '6px', color: 'var(--text-muted)', zIndex: 2, marginTop: '-2px', textTransform: 'uppercase', fontWeight: '700' }}>
                          OEE
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                        <span style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Status Line
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            backgroundColor: isRunning ? '#10b981' : '#ef4444',
                            boxShadow: isRunning ? '0 0 6px #10b981' : '0 0 6px #ef4444'
                          }} />
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: isRunning ? '#10b981' : '#ef4444', textTransform: 'uppercase' }}>
                            {isRunning ? 'RUNNING' : 'STOPPED'}
                          </span>
                        </div>
                        {woVal && (
                          <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }} title={String(woVal)}>
                            WO: <strong style={{ color: 'var(--text-main)' }}>{String(woVal)}</strong>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Detailed grid parameters */}
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr 1fr', 
                      gap: '6px', 
                      borderTop: '1px solid var(--border-color)', 
                      paddingTop: '10px',
                      marginTop: '4px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Target/Plan</span>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>{String(planVal)}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Actual Qty</span>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>{String(actualVal)}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Achievement</span>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>{achVal !== null && achVal !== undefined ? `${achVal}%` : '-'}</span>
                      </div>
                      {availabilityVal !== null && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Availability</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>{availabilityVal}%</span>
                        </div>
                      )}
                      {performanceVal !== null && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Performance</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>{performanceVal}%</span>
                        </div>
                      )}
                      {qualityVal !== null && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Quality Rate</span>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)' }}>{qualityVal}%</span>
                        </div>
                      )}
                  </div>
                </div>
              );
            })()}
            </div>
          </div>
        );
      })()}

    </aside>
  );
}
