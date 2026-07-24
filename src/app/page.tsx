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
  const [blueprintOpacity, setBlueprintOpacity] = useState(() => {
    try { const v = sessionStorage.getItem('mtm_satellite_opacity_bp'); return v !== null ? parseFloat(v) : 0.25; } catch { return 0.25; }
  });
  const [satelliteOpacity, setSatelliteOpacity] = useState(() => {
    try { const v = sessionStorage.getItem('mtm_satellite_opacity'); return v !== null ? parseFloat(v) : 0.8; } catch { return 0.8; }
  });
  const [shapeOpacity, setShapeOpacity] = useState(() => {
    try { const v = sessionStorage.getItem('mtm_shape_opacity'); return v !== null ? parseFloat(v) : 0.5; } catch { return 0.5; }
  });
  const [showGridL2, setShowGridL2] = useState(true);
  const [showRoadsL1, setShowRoadsL1] = useState(true);
  const [showParentBuildings, setShowParentBuildings] = useState(() => {
    try { const v = sessionStorage.getItem('mtm_show_parent'); return v !== null ? v === 'true' : true; } catch { return true; }
  });
  const [showChildBuildings, setShowChildBuildings] = useState(() => {
    try { const v = sessionStorage.getItem('mtm_show_child'); return v !== null ? v === 'true' : false; } catch { return false; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  // On mount: clear old local storage cache and setup listeners, plus load sessionStorage state
  useEffect(() => {
    try {
      localStorage.removeItem(LIVE_STORAGE_KEY);

      const bld = sessionStorage.getItem('mtm_selected_bld');
      const view = sessionStorage.getItem('mtm_active_view');

      if (bld) setSelectedBuildingId(bld);
      if (view === 'satellite' || view === 'layout') setActiveView(view as 'satellite' | 'layout');
      // showParent, showChild, and opacity values are now restored via lazy useState initializers
    } catch (_) {}

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

  // Save selections to sessionStorage on change
  useEffect(() => {
    try {
      if (selectedBuildingId) {
        sessionStorage.setItem('mtm_selected_bld', selectedBuildingId);
      } else {
        sessionStorage.removeItem('mtm_selected_bld');
      }
    } catch (_) {}
  }, [selectedBuildingId]);

  useEffect(() => {
    try {
      sessionStorage.setItem('mtm_active_view', activeView);
    } catch (_) {}
  }, [activeView]);

  useEffect(() => {
    try { sessionStorage.setItem('mtm_show_parent', String(showParentBuildings)); } catch (_) {}
  }, [showParentBuildings]);

  useEffect(() => {
    try { sessionStorage.setItem('mtm_show_child', String(showChildBuildings)); } catch (_) {}
  }, [showChildBuildings]);

  useEffect(() => {
    try { sessionStorage.setItem('mtm_satellite_opacity', String(satelliteOpacity)); } catch (_) {}
  }, [satelliteOpacity]);

  useEffect(() => {
    try { sessionStorage.setItem('mtm_shape_opacity', String(shapeOpacity)); } catch (_) {}
  }, [shapeOpacity]);

  useEffect(() => {
    try { sessionStorage.setItem('mtm_satellite_opacity_bp', String(blueprintOpacity)); } catch (_) {}
  }, [blueprintOpacity]);

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoading) {
    return (
      <div className={`app-container theme-${theme}`} style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {/* Skeleton Topbar */}
        <header className="app-topbar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="skeleton-pulse" style={{ width: '140px', height: '24px', backgroundColor: 'var(--border-color)' }}></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="skeleton-pulse" style={{ width: '280px', height: '28px', backgroundColor: 'var(--border-color)' }}></div>
            <div className="skeleton-pulse" style={{ width: '32px', height: '28px', backgroundColor: 'var(--border-color)' }}></div>
          </div>
        </header>
        
        {/* Skeleton Workspace */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Skeleton Sidebar */}
          <aside className="sidebar-container" style={{ width: '250px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: 'var(--bg-main)', borderRight: '1px solid var(--border-color)' }}>
            <div className="skeleton-pulse" style={{ width: '100%', height: '40px', backgroundColor: 'var(--border-color)' }}></div>
            <div className="skeleton-pulse" style={{ width: '100%', height: '140px', backgroundColor: 'var(--border-color)' }}></div>
            <div className="skeleton-pulse" style={{ width: '100%', height: '180px', backgroundColor: 'var(--border-color)' }}></div>
          </aside>
          
          {/* Skeleton Map Canvas */}
          <main className="map-workspace" style={{ display: 'flex', flex: 1, backgroundColor: 'var(--bg-canvas-container)', position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
            <div className="skeleton-pulse" style={{ width: '50%', height: '50%', backgroundColor: 'var(--border-color)', opacity: 0.1 }}></div>
          </main>
        </div>
      </div>
    );
  }

  const liveTime = liveInfo
    ? new Date(liveInfo.pushedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <div className={`app-container theme-${theme}`}>
      {/* Sleek Theme-Aware Topbar Header */}
      <header className="app-topbar">
        {/* Left: Brand Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/assets/img/mtmwide.png" 
            alt="PT MTM Logo" 
            style={{ height: '24px', width: 'auto', objectFit: 'contain' }} 
          />
          <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-color)', paddingLeft: '12px' }}>
            PETA PABRIK INTERAKTIF
          </span>
        </div>

        {/* Right: Search Bar attached next to Icon-Only Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Cari area, stasiun, gedung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 30px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '0px',
                fontSize: '12px',
                color: 'var(--text-main)',
                outline: 'none',
              }}
            />
            <svg
              style={{
                position: 'absolute',
                left: '9px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                width: '13px',
                height: '13px',
              }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Smart Search Dropdown List */}
            {searchQuery.trim().length > 0 && (() => {
              const matched = activeBuildings.filter(b => 
                b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (b.code && b.code.toLowerCase().includes(searchQuery.toLowerCase()))
              ).slice(0, 10);

              if (matched.length === 0) return null;

              return (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  borderTop: 'none',
                  zIndex: 999,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  borderRadius: '0px',
                }}>
                  {matched.map((item) => {
                    const isChild = item.parentShapeId && activeBuildings.some(p => p.id === item.parentShapeId);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isChild) {
                            setShowChildBuildings(true);
                          } else {
                            setShowParentBuildings(true);
                          }
                          handleSelectBuilding(item.id);
                          setSearchQuery('');
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                        }}
                        className="search-dropdown-item"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                            {item.name}
                          </span>
                          {item.code && (
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: '2px 6px' }}>
                              {item.code}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                          {isChild ? 'Ruangan Dalam (Child)' : 'Gedung Utama (Parent)'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Icon-Only Theme Toggle Button */}
          <button 
            className="theme-toggle-btn" 
            onClick={handleToggleTheme} 
            title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '0px',
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

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
            showSettings={showSettingsSidebar}
            onToggleSettings={() => setShowSettingsSidebar(!showSettingsSidebar)}
            onSatelliteOpacityChange={setSatelliteOpacity}
            onShapeOpacityChange={setShapeOpacity}
            showParentBuildings={showParentBuildings}
            showChildBuildings={showChildBuildings}
            onToggleParentBuildings={setShowParentBuildings}
            onToggleChildBuildings={setShowChildBuildings}
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

    </div>
  );
}
