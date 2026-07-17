'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ZoneData, MachineData } from '../data/mapData';

interface MapLayoutProps {
  zones: ZoneData[];
  selectedZoneId: string | null;
  selectedMachineId: string | null;
  onSelectZone: (id: string) => void;
  onSelectMachine: (zoneId: string, machineId: string) => void;
  searchTarget: { type: 'zone' | 'machine'; id: string; zoneId?: string } | null;
  clearSearchTarget: () => void;
  bgOpacity: number;
  onBgOpacityChange: (opacity: number) => void;
  showGrid: boolean;
}

export default function MapLayout({
  zones,
  selectedZoneId,
  selectedMachineId,
  onSelectZone,
  onSelectMachine,
  searchTarget,
  clearSearchTarget,
  bgOpacity,
  onBgOpacityChange,
  showGrid,
}: MapLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);


  // Zoom & Pan states
  const [scale, setScale] = useState(0.65);
  const [offset, setOffset] = useState({ x: 200, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [animateTransform, setAnimateTransform] = useState(true);



  // Dimensions of canvas (L2.png original size)
  const canvasWidth = 1080;
  const canvasHeight = 1350;

  // Handle auto-panning when a search target is selected
  useEffect(() => {
    if (!searchTarget) return;

    // We want to center the searched element
    let targetX = canvasWidth / 2;
    let targetY = canvasHeight / 2;
    let targetZoom = 1.0;

    if (searchTarget.type === 'zone') {
      const zone = zones.find((z) => z.id === searchTarget.id);
      if (zone) {
        targetX = zone.left + zone.width / 2;
        targetY = zone.top + zone.height / 2;
        targetZoom = Math.min(1.2, 800 / Math.max(zone.width, zone.height));
      }
    } else if (searchTarget.type === 'machine' && searchTarget.zoneId) {
      const zone = zones.find((z) => z.id === searchTarget.zoneId);
      const machine = zone?.machines.find((m) => m.id === searchTarget.id);
      if (zone && machine) {
        // Machine coordinates are relative to zone
        targetX = zone.left + machine.left + (machine.width || 30) / 2;
        targetY = zone.top + machine.top + (machine.height || 30) / 2;
        targetZoom = 1.5;
      }
    }

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      // Enable smooth animation for auto-pan
      setAnimateTransform(true);
      setScale(targetZoom);
      setOffset({
        x: containerWidth / 2 - targetX * targetZoom,
        y: containerHeight / 2 - targetY * targetZoom,
      });
    }

    // Clear search target trigger after processing
    const timer = setTimeout(() => {
      clearSearchTarget();
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTarget, zones]);

  // Handle Zoom on Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomIntensity = 0.1;
    const mouseX = e.clientX - containerRef.current.getBoundingClientRect().left;
    const mouseY = e.clientY - containerRef.current.getBoundingClientRect().top;

    // Calculate canvas coordinates before zoom
    const canvasMouseX = (mouseX - offset.x) / scale;
    const canvasMouseY = (mouseY - offset.y) / scale;

    // Calculate new scale
    const delta = -e.deltaY;
    const newScale = Math.max(0.2, Math.min(3.5, scale + (delta > 0 ? 1 : -1) * zoomIntensity * scale));

    // Calculate new offset to zoom towards mouse position
    const newOffsetX = mouseX - canvasMouseX * newScale;
    const newOffsetY = mouseY - canvasMouseY * newScale;

    // Disable CSS animations for direct mouse interaction
    setAnimateTransform(false);
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    setAnimateTransform(false); // disable animation during drag
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    if (!containerRef.current) return;
    setAnimateTransform(true);
    setScale((prev) => Math.min(3.5, prev + 0.25));
    // Zoom toward center
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    setOffset((prev) => ({
      x: prev.x - (w / 2 - prev.x) * (0.25 / scale),
      y: prev.y - (h / 2 - prev.y) * (0.25 / scale),
    }));
  };

  const handleZoomOut = () => {
    if (!containerRef.current) return;
    setAnimateTransform(true);
    setScale((prev) => Math.max(0.2, prev - 0.25));
    // Zoom out from center
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    setOffset((prev) => ({
      x: prev.x + (w / 2 - prev.x) * (0.25 / scale),
      y: prev.y + (h / 2 - prev.y) * (0.25 / scale),
    }));
  };

  const handleReset = () => {
    if (!containerRef.current) return;
    setAnimateTransform(true);
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const baseScale = Math.min(
      (containerWidth - 60) / canvasWidth,
      (containerHeight - 60) / canvasHeight
    );
    setScale(baseScale);
    setOffset({
      x: (containerWidth - canvasWidth * baseScale) / 2,
      y: (containerHeight - canvasHeight * baseScale) / 2,
    });
  };

  // Run initial reset to center canvas
  useEffect(() => {
    handleReset();
    // Add event listeners on window to stop drag if mouse is released outside canvas
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div
      className="map-layout-container"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      onClick={() => {
        onSelectZone('');
      }}
    >
      {/* Zoom and settings controls floating on map */}
      <div className="map-controls" onClick={(e) => e.stopPropagation()}>
        <button onClick={handleZoomIn} title="Zoom In" className="control-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" className="control-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>
        <button onClick={handleReset} title="Reset View" className="control-btn">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
      </div>

      {/* Interactive Map Canvas Wrapper */}
      <div
        ref={canvasRef}
        className={`layout-canvas ${animateTransform ? 'animate-canvas' : ''}`}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Underlay Blueprint (L2.png) */}
        <img
          src="/map-img/L2.png"
          alt="Blueprint MTM"
          className="blueprint-underlay"
          style={{ opacity: bgOpacity }}
          draggable="false"
        />

        {/* CSS Grid Lines */}
        {showGrid && <div className="canvas-grid-overlay" />}

        {/* Outer Perimeter Wall */}
        <div className="canvas-outer-wall" />

        {/* Zones & Machines Layer */}
        {zones.map((zone) => {
          const isZoneSelected = selectedZoneId === zone.id;

          return (
            <div
              key={zone.id}
              className={`layout-zone ${isZoneSelected ? 'selected-zone' : ''} ${
                zone.id === 'GUDANG-KORIDOR' ? 'corridor-zone' : ''
              }`}
              style={{
                left: `${zone.left}px`,
                top: `${zone.top}px`,
                width: `${zone.width}px`,
                height: `${zone.height}px`,
                backgroundColor: zone.backgroundColor || undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Only select zone if we clicked on the zone card background itself
                if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('layout-zone-label')) {
                  onSelectZone(zone.id);
                }
              }}
            >
              {/* Zone Name Label */}
              <div
                className="layout-zone-label"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectZone(zone.id);
                }}
              >
                {zone.name.split(' (')[0]}
              </div>

              {/* Render Machines in this Zone */}
              {zone.machines.map((machine) => {
                const isMachineSelected = selectedMachineId === machine.id;
                const efficiencyColor =
                  machine.status === 'running'
                    ? machine.efficiency > 90
                      ? 'emerald'
                      : 'amber'
                    : machine.status === 'maintenance'
                    ? 'rose'
                    : 'zinc';

                // Render circle type
                if (machine.type === 'circle') {
                  return (
                    <div
                      key={machine.id}
                      className={`machine-circle ${machine.isPink ? 'pink-gradient' : ''} ${
                        isMachineSelected ? 'selected-machine' : ''
                      } status-${machine.status}`}
                      style={{
                        left: `${machine.left}px`,
                        top: `${machine.top}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMachine(zone.id, machine.id);
                      }}
                      title={`${machine.name} (Eff: ${machine.efficiency}%) - ${machine.status}`}
                    >
                      <span className="machine-id-text">{machine.name}</span>
                      {machine.status === 'running' && <span className="machine-pulse" />}
                    </div>
                  );
                }

                // Render vertical/horizontal bar type
                if (machine.type === 'bar') {
                  return (
                    <div
                      key={machine.id}
                      className={`machine-bar ${isMachineSelected ? 'selected-machine' : ''} status-${
                        machine.status
                      }`}
                      style={{
                        left: `${machine.left}px`,
                        top: `${machine.top}px`,
                        width: `${machine.width}px`,
                        height: `${machine.height}px`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectMachine(zone.id, machine.id);
                      }}
                      title={`${machine.name} (Eff: ${machine.efficiency}%) - ${machine.status}`}
                    >
                      <span className="machine-id-text vertical">{machine.name}</span>
                      {machine.status === 'running' && <span className="machine-pulse" />}
                    </div>
                  );
                }

                // Render rectangle cell type
                return (
                  <div
                    key={machine.id}
                    className={`machine-cell ${isMachineSelected ? 'selected-machine' : ''} status-${
                      machine.status
                    }`}
                    style={{
                      left: `${machine.left}px`,
                      top: `${machine.top}px`,
                      width: `${machine.width}px`,
                      height: `${machine.height}px`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMachine(zone.id, machine.id);
                    }}
                    title={`${machine.name} (Eff: ${machine.efficiency}%) - ${machine.status}`}
                  >
                    <span className="machine-id-text">{machine.name}</span>
                    {machine.hasDot && <span className={`machine-status-dot bg-${efficiencyColor}`} />}
                    {machine.status === 'running' && <span className="machine-pulse" />}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Legend Overlay inside canvas */}
        <div className="canvas-legend" onClick={(e) => e.stopPropagation()}>
          <div className="legend-title">Keterangan Mesin</div>
          <div className="legend-item">
            <span className="legend-color-box status-running" />
            <span>Running (Aktif)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box status-idle" />
            <span>Idle (Standby)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box status-maintenance" />
            <span>Maintenance (Perbaikan)</span>
          </div>
          <div className="legend-item">
            <span className="legend-color-box pink-legend" />
            <span>High-Pressure / Special Ops</span>
          </div>
        </div>
      </div>
    </div>
  );
}
