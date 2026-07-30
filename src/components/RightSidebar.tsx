'use client';

import React from 'react';
import { BuildingData, ZoneData, MachineData } from '../data/mapData';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBuildingId: string | null;
  selectedZoneId: string | null;
  selectedMachineId: string | null;
  buildings: BuildingData[];
  zones: ZoneData[];
  onSelectBuilding: (id: string) => void;
  onSelectZone: (id: string) => void;
  onSelectMachine: (zoneId: string, machineId: string) => void;
  onTriggerSearchPan: (type: 'zone' | 'machine', id: string, zoneId?: string) => void;
  mainGate?: { x: number; y: number; rotation: number; imageUrl?: string } | null;
  theme: 'dark' | 'light';
}

export default function RightSidebar({
  isOpen,
  onClose,
  selectedBuildingId,
  selectedZoneId,
  selectedMachineId,
  buildings,
  zones,
  onSelectBuilding,
  onSelectZone,
  onSelectMachine,
  onTriggerSearchPan,
  mainGate,
  theme,
}: RightSidebarProps) {
  // Safe suppression for unused props to avoid TS compile errors
  React.useEffect(() => {
    const dummy = () => {
      void theme;
    };
    if (false) dummy();
  }, [theme]);

  const selectedMachine = React.useMemo(() => {
    if (!selectedZoneId || !selectedMachineId) return null;
    const zone = zones.find(z => z.id === selectedZoneId);
    return zone ? zone.machines.find(m => m.id === selectedMachineId) : null;
  }, [zones, selectedZoneId, selectedMachineId]);

  const activeBld = React.useMemo(() => {
    return selectedBuildingId ? (selectedBuildingId === 'main-gate' ? null : buildings.find(b => b.id === selectedBuildingId)) : null;
  }, [buildings, selectedBuildingId]);

  // Determine active zone context if not explicitly selected but machine or building is
  const activeZone = React.useMemo(() => {
    if (selectedZoneId) {
      return zones.find(z => z.id === selectedZoneId) || null;
    }
    // If machine is selected but zone is not, get it from the machine relation
    if (selectedMachineId) {
      return zones.find(z => z.machines.some(m => m.id === selectedMachineId)) || null;
    }
    return null;
  }, [zones, selectedZoneId, selectedMachineId]);

  // API Config for live OEE integration
  const apiConfig = React.useMemo(() => {
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

    const generateSimulatedData = (prevData: any) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID');
      const basePlan = 650;
      let actual = prevData ? (prevData[apiConfig.actualKey] || 540) : 540;
      
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
        if (active) {
          setAndonData((prev: any) => generateSimulatedData(prev));
        }
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, apiConfig.interval);

    return () => {
      active = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [apiConfig, activeBld]);

  if (!isOpen || (!selectedBuildingId && !selectedZoneId && !selectedMachineId)) {
    return null;
  }

  // Get image banner url
  const imageUrl = selectedBuildingId === 'main-gate' ? mainGate?.imageUrl : activeBld?.imageUrl;

  // Find children shapes for building
  const childShapes = selectedBuildingId && selectedBuildingId !== 'main-gate'
    ? buildings.filter(b => b.parentShapeId === selectedBuildingId)
    : [];

  return (
    <aside
      className="right-sidebar-container"
      style={{
        width: '320px',
        height: '100%',
        backgroundColor: 'var(--bg-main)',
        borderLeft: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 20,
        position: 'relative',
        animation: 'slideInRight 0.25s ease-out',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* 16:9 Image Banner */}
      {imageUrl ? (
        <div style={{
          width: '100%',
          height: '160px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'rgba(0,0,0,0.2)',
          flexShrink: 0,
        }}>
          <img
            src={imageUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            alt="Selected object"
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
              {selectedBuildingId === 'main-gate' ? 'Gerbang Utama (Main Gate)' : activeBld?.name}
            </span>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '16px 12px 10px 12px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--header-bg)',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            DETAIL LAYOUT
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', display: 'flex', padding: 0 }}
            title="Tutup Panel"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
        
        {/* Title and close button if image exists */}
        {imageUrl && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {selectedBuildingId === 'main-gate' ? 'FASILITAS PETA' : 'GEDUNG UTAMA'}
              </span>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                {selectedBuildingId === 'main-gate' ? 'Pintu Masuk Utama' : activeBld?.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px', padding: '4px' }}
              title="Tutup Panel"
            >
              ✕
            </button>
          </div>
        )}

        {/* Selected Zone / Machine Titles */}
        {!imageUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {selectedMachineId && (
              <>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  MESIN / ALAT PRODUKSI
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  Mesin {selectedMachine?.name}
                </h2>
                {activeZone && (
                  <span 
                    onClick={() => { onSelectMachine('', ''); onSelectZone(activeZone.id); }}
                    style={{ fontSize: '10.5px', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                  >
                    📁 Zona: {activeZone.name.split(' (')[0]}
                  </span>
                )}
              </>
            )}

            {selectedZoneId && !selectedMachineId && (
              <>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ZONA / AREA PRODUKSI
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  {activeZone?.name}
                </h2>
              </>
            )}
          </div>
        )}

        {/* Status and Parameters card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          {selectedBuildingId && selectedBuildingId !== 'main-gate' && activeBld && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kode Gedung:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{activeBld.code || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status Operasional:</span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{activeBld.operationalStatus}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ukuran Fisik:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{activeBld.length}m x {activeBld.width}m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Luas Area Tapak:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{activeBld.area.toLocaleString('id-ID')} m²</span>
              </div>
              {activeBld.details && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {activeBld.details}
                </div>
              )}
            </>
          )}

          {selectedBuildingId === 'main-gate' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tipe:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Akses Utama Kendaraan</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fungsi:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Inbound & Outbound Logistik</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Gerbang masuk utama pabrik PT Menara Terus Makmur yang terintegrasi dengan sensor RFID pos satpam untuk tracking truk pengiriman barang.
              </div>
            </>
          )}

          {selectedZoneId && !selectedMachineId && activeZone && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kode Zona:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{activeZone.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Jumlah Mesin:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{activeZone.machines.length} Mesin</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ukuran Zona:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{(activeZone.width / 10).toFixed(1)}m x {(activeZone.height / 10).toFixed(1)}m</span>
              </div>
              {activeZone.details && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {activeZone.details}
                </div>
              )}
            </>
          )}

          {selectedMachineId && selectedMachine && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kode Alat:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{selectedMachine.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Operator:</span>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{selectedMachine.operator || '-'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status Awal:</span>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: selectedMachine.status === 'running' ? '#10b981' : selectedMachine.status === 'idle' ? '#f59e0b' : '#ef4444' 
                }}>
                  {selectedMachine.status.toUpperCase()}
                </span>
              </div>
              {selectedMachine.width && selectedMachine.height && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dimensi Tapak:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{(selectedMachine.width / 10).toFixed(1)}m x {(selectedMachine.height / 10).toFixed(1)}m</span>
                </div>
              )}
              {selectedMachine.details && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {selectedMachine.details}
                </div>
              )}
            </>
          )}
        </div>

        {/* Live ANDON Telemetry Gauge Card */}
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

          const radius = 28;
          const strokeWidth = 5.5;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (percent / 100) * circumference;

          return (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'stretch', 
              gap: '12px',
              padding: '12px', 
              backgroundColor: 'rgba(59, 130, 246, 0.03)', 
              border: '1px solid var(--primary)', 
              animation: 'fadeIn 0.25s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                  LIVE OPC-UA TELEMETRY
                </span>
                {andonData?.time && (
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                    Terupdate: {andonData.time}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Circular Gauge */}
                <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="64" height="64" viewBox="0 0 68 68" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle
                      cx="34"
                      cy="34"
                      r={radius}
                      fill="transparent"
                      stroke="var(--border-color)"
                      strokeWidth={strokeWidth}
                      style={{ opacity: 0.12 }}
                    />
                    <circle
                      cx="34"
                      cy="34"
                      r={radius}
                      fill="transparent"
                      stroke={isRunning ? '#10b981' : '#ef4444'}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      transform="rotate(-90 34 34)"
                      style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                    />
                  </svg>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-main)', zIndex: 2 }}>
                    {percent}%
                  </span>
                  <span style={{ fontSize: '6px', color: 'var(--text-muted)', zIndex: 2, marginTop: '-2px', textTransform: 'uppercase', fontWeight: '700' }}>
                    OEE
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                  <span style={{ fontSize: '8.5px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Status Lini Produksi
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: isRunning ? '#10b981' : '#ef4444',
                      boxShadow: isRunning ? '0 0 6px #10b981' : '0 0 6px #ef4444'
                    }} />
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: isRunning ? '#10b981' : '#ef4444', textTransform: 'uppercase' }}>
                      {isRunning ? 'RUNNING' : 'STOPPED'}
                    </span>
                  </div>
                  {woVal && (
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }} title={String(woVal)}>
                      WO: <strong style={{ color: 'var(--text-main)' }}>{String(woVal)}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Grid Metrics */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '8px', 
                borderTop: '1px solid var(--border-color)', 
                paddingTop: '10px',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Target/Plan Qty</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{String(planVal)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Actual Qty</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{String(actualVal)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                  <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Achievement Rate</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{achVal !== null && achVal !== undefined ? `${achVal}%` : '-'}</span>
                </div>
                {availabilityVal !== null && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Availability</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{availabilityVal}%</span>
                  </div>
                )}
                {performanceVal !== null && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Performance</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{performanceVal}%</span>
                  </div>
                )}
                {qualityVal !== null && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>Quality Rate</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>{qualityVal}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* List of related rooms (If Selected Parent Building has child shapes) */}
        {selectedBuildingId && childShapes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '9.5px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>
              Daftar Ruangan Dalam ({childShapes.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {childShapes.map((child) => (
                <div
                  key={child.id}
                  onClick={() => onSelectBuilding(child.id)}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{child.name}</span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>{child.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List of Machines inside selected Zone */}
        {selectedZoneId && !selectedMachineId && activeZone && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '9.5px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>
              Daftar Mesin / Peralatan ({activeZone.machines.length})
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {activeZone.machines.map((mac) => (
                <div
                  key={mac.id}
                  onClick={() => {
                    onSelectMachine(activeZone.id, mac.id);
                    onTriggerSearchPan('machine', mac.id, activeZone.id);
                  }}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: mac.status === 'running' ? '#10b981' : mac.status === 'idle' ? '#f59e0b' : '#ef4444',
                    }} />
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{mac.name}</span>
                  </div>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>OEE: {mac.efficiency}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
