'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BuildingData, roads } from '../data/mapData';
import OpcBar from './OpcBar';

const SVG_ICONS: Record<string, string> = {
  mesin: `<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L1.97 8.24a.5.5 0 0 0 .12.64l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.12.22.37.29.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.42.5.42h3.84c.24 0 .44-.17.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>`,
  listrik: `<path d="M11.5 2L3 13h7v9l8.5-11h-7z"/>`,
  taman: `<path d="M5 21a1 1 0 0 1-1-1c0-4.5 3-9 7-11a1 1 0 0 1 1.5 1c-.5 4-2.5 8-6.5 10a1 1 0 0 1-1 1zm7 0a1 1 0 0 1-1-1c0-5.5 2-11 6-13a1 1 0 0 1 1.5 1c-.5 5-2.5 10-5.5 12a1 1 0 0 1-1 1zm5 0a1 1 0 0 1-1-1c0-3.5 1.5-7 4-9a1 1 0 0 1 1.5 1c-.5 3-1.5 6-3.5 8a1 1 0 0 1-1 1z"/>`,
  masjid: `<path d="M12 2c.4 0 .7.3.7.7v1.1c2 .2 3.8 1.3 4.8 3.1.2-.1.4-.2.6-.2 1 0 1.9.9 1.9 1.9 0 .4-.1.8-.4 1.1l-1.3 5.4c.5.3.7.8.7 1.4v2.5c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-2.5c0-.6.3-1.1.7-1.4l-1.3-5.4C4.1 9.9 4 9.5 4 9.1c0-1 .9-1.9 1.9-1.9.2 0 .4.1.6.2C7.5 5.6 9.3 4.5 11.3 4.3V2.7c0-.4.3-.7.7-.7zm0 3.3c-3.1 0-5.7 2.3-6.1 5.3h12.2C17.7 7.6 15.1 5.3 12 5.3zM7 16.5v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z"/>`,
  parkir: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 11h-3v3H8V8h5c1.66 0 3 1.34 3 3s-1.34 3-3 3zm0-4h-3v2h3c.55 0 1-.45 1-1s-.45-1-1-1z"/>`,
  areal: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>`
};

interface MapProps {
  buildings: BuildingData[];
  selectedBuildingId: string | null;
  onSelectBuilding: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  bgOpacity: number;
  shapeOpacity: number;
  showRoads: boolean;
  activeView: 'satellite' | 'layout';
  showSettings: boolean;
  onToggleSettings: () => void;
  onSatelliteOpacityChange: (val: number) => void;
  onShapeOpacityChange: (val: number) => void;
  showParentBuildings: boolean;
  showChildBuildings: boolean;
  onToggleParentBuildings: (val: boolean) => void;
  onToggleChildBuildings: (val: boolean) => void;
  showGateLines: boolean;
  onToggleGateLines: (val: boolean) => void;
  mainGate?: { x: number; y: number; rotation: number } | null;
}

export default function Map({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  hoveredId,
  setHoveredId,
  bgOpacity,
  shapeOpacity,
  showRoads,
  activeView,
  showSettings,
  onToggleSettings,
  onSatelliteOpacityChange,
  onShapeOpacityChange,
  showParentBuildings,
  showChildBuildings,
  onToggleParentBuildings,
  onToggleChildBuildings,
  showGateLines,
  onToggleGateLines,
  mainGate,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartMouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Zoom & Pan states — lazy initializers read sessionStorage synchronously on first render
  const [scale, setScale] = useState(() => {
    try {
      const v = sessionStorage.getItem('mtm_map_scale');
      const p = v !== null ? parseFloat(v) : NaN;
      return !isNaN(p) && p > 0 ? p : 0.65;
    } catch { return 0.65; }
  });
  const [offset, setOffset] = useState(() => {
    try {
      const x = sessionStorage.getItem('mtm_map_offset_x');
      const y = sessionStorage.getItem('mtm_map_offset_y');
      const px = x !== null ? parseFloat(x) : NaN;
      const py = y !== null ? parseFloat(y) : NaN;
      return !isNaN(px) && !isNaN(py) ? { x: px, y: py } : { x: 200, y: 50 };
    } catch { return { x: 200, y: 50 }; }
  });
  const [animateTransform, setAnimateTransform] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [focusBuildingId, setFocusBuildingId] = useState<string | null>(null);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);
  const [rotation, setRotation] = useState(() => {
    try {
      const v = sessionStorage.getItem('mtm_map_rotation');
      return v !== null ? parseInt(v, 10) : 0;
    } catch { return 0; }
  });
  const [isFocusMode, setIsFocusMode] = useState(() => {
    try {
      const v = sessionStorage.getItem('mtm_map_focus_mode');
      return v !== null ? v === 'true' : true;
    } catch { return true; }
  });
  const rotationRef = useRef(rotation);
  // Flag: when true, ResizeObserver won't override position with handleReset
  const restoredFromSessionRef = useRef(false);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  const canvasWidth = 3323;
  const canvasHeight = 3159;

  // Center target building when selected from sidebar
  useEffect(() => {
    if (!selectedBuildingId) return;

    const bld = buildings.find((b) => b.id === selectedBuildingId);
    if (!bld) return;

    // Get approximate center of the building points
    const coords = bld.points.split(' ').map((p) => p.split(',').map(Number));
    const xs = coords.map((c) => c[0]);
    const ys = coords.map((c) => c[1]);
    const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
    const centerY = (Math.max(...ys) + Math.min(...ys)) / 2;

    // Translate percentages (0-100) to actual canvas pixels
    const targetX = (centerX / 100) * canvasWidth;
    const targetY = (centerY / 100) * canvasHeight;
    
    const isChild = bld.parentShapeId && buildings.some(p => p.id === bld.parentShapeId);
    const targetZoom = isChild ? 1.1 : 0.65;

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      setAnimateTransform(true);
      setScale(targetZoom);
      scaleRef.current = targetZoom;
      setOffset({
        x: containerWidth / 2 - targetX * targetZoom,
        y: containerHeight / 2 - targetY * targetZoom,
      });
    }
  }, [selectedBuildingId, buildings]);

  // Ultra-responsive high-performance 0-delay drag handler
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    setIsInteracting(true);
    dragStartRef.current = { x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y };
    dragStartMouseRef.current = { x: e.clientX, y: e.clientY };

    // Synchronously remove CSS transition delay immediately to eliminate 0.4s lag
    if (canvasRef.current) {
      canvasRef.current.style.transition = 'none';
      canvasRef.current.style.willChange = 'transform';
    }

    const onPointerMove = (moveEvent: MouseEvent | PointerEvent) => {
      if (!isDraggingRef.current) return;
      const newX = moveEvent.clientX - dragStartRef.current.x;
      const newY = moveEvent.clientY - dragStartRef.current.y;
      
      offsetRef.current = { x: newX, y: newY };
      
      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${scaleRef.current}) translate(${canvasWidth / 2}px, ${canvasHeight / 2}px) rotate(${rotationRef.current}deg) translate(${-canvasWidth / 2}px, ${-canvasHeight / 2}px)`;
      }
    };

    const onPointerUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      setIsInteracting(false);

      if (canvasRef.current) {
        canvasRef.current.style.transition = '';
        canvasRef.current.style.willChange = 'auto';
      }

      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      setOffset(offsetRef.current);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleElementClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const dx = e.clientX - dragStartMouseRef.current.x;
    const dy = e.clientY - dragStartMouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Threshold is 5 pixels to distinguish drag vs click
    if (distance < 5) {
      onSelectBuilding(id);
    }
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const dx = e.clientX - dragStartMouseRef.current.x;
    const dy = e.clientY - dragStartMouseRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Threshold is 5 pixels to distinguish drag vs click
    if (distance < 5) {
      onSelectBuilding('');
    }
  };

  const handleZoomIn = () => {
    if (!containerRef.current) return;
    setAnimateTransform(true);
    setScale((prev) => Math.min(3.5, prev + 0.25));
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
    setScale((prev) => Math.max(0.05, prev - 0.25));
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    setOffset((prev) => ({
      x: prev.x + (w / 2 - prev.x) * (0.25 / scale),
      y: prev.y + (h / 2 - prev.y) * (0.25 / scale),
    }));
  };

  const handleReset = useCallback((animate = false) => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    setAnimateTransform(animate);
    const baseScale = Math.min(
      (containerWidth - 60) / canvasWidth,
      (containerHeight - 60) / canvasHeight
    );
    const newOffset = {
      x: (containerWidth - canvasWidth * baseScale) / 2,
      y: (containerHeight - canvasHeight * baseScale) / 2,
    };
    setScale(baseScale);
    scaleRef.current = baseScale;
    setOffset(newOffset);
    offsetRef.current = newOffset;
    setRotation(0);
    rotationRef.current = 0;
  }, [canvasWidth, canvasHeight]);

  const handleRotate = () => {
    setAnimateTransform(true);
    setRotation((prev) => (prev + 90) % 360);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        setOffset(offsetRef.current);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);

    const container = containerRef.current;
    
    // Manual non-passive wheel event listener to support touchpad controls
    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      if (!container) return;

      // Direct scroll wheel zoom (Ctrl not required)
      const zoomIntensity = 0.0015;
      const factor = Math.exp(-e.deltaY * zoomIntensity);

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setAnimateTransform(false);

      const currentScale = scaleRef.current;
      const currentOffset = offsetRef.current;

      const newScale = Math.max(0.05, Math.min(3.5, currentScale * factor));
      const canvasMouseX = (mouseX - currentOffset.x) / currentScale;
      const canvasMouseY = (mouseY - currentOffset.y) / currentScale;

      const newOffset = {
        x: mouseX - canvasMouseX * newScale,
        y: mouseY - canvasMouseY * newScale,
      };

      // Sync refs immediately to prevent race conditions during rapid scrolling
      scaleRef.current = newScale;
      offsetRef.current = newOffset;

      setIsInteracting(true);
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = setTimeout(() => {
        setIsInteracting(false);
      }, 180);

      setScale(newScale);
      setOffset(newOffset);
    };

    if (container) {
      container.addEventListener('wheel', handleWheelEvent, { passive: false });
    }

    const observer = new ResizeObserver(() => {
      // Only reset on resize when we haven't restored from session
      if (!restoredFromSessionRef.current) {
        handleReset(false);
      }
    });
    if (container) {
      observer.observe(container);
    }

    // Mark as restored from session if valid session data exists (lazy useState already loaded the values)
    try {
      const savedScale = sessionStorage.getItem('mtm_map_scale');
      const savedOffsetX = sessionStorage.getItem('mtm_map_offset_x');
      const savedOffsetY = sessionStorage.getItem('mtm_map_offset_y');
      if (savedScale && savedOffsetX && savedOffsetY) {
        const ps = parseFloat(savedScale);
        const px = parseFloat(savedOffsetX);
        const py = parseFloat(savedOffsetY);
        if (!isNaN(ps) && !isNaN(px) && !isNaN(py) && ps > 0) {
          // Values already in state from lazy init — just block handleReset
          restoredFromSessionRef.current = true;
        }
      }
    } catch (_) {}

    if (!restoredFromSessionRef.current) {
      handleReset(false);
    }

    const timer = setTimeout(() => {
      if (!restoredFromSessionRef.current) {
        handleReset(false);
      }
    }, 100);

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (container) {
        container.removeEventListener('wheel', handleWheelEvent);
        observer.disconnect();
      }
      clearTimeout(timer);
    };
  }, [handleReset]);

  // Save positioning state to sessionStorage on change
  useEffect(() => {
    // Don't overwrite session data on the very first render after restore
    if (!restoredFromSessionRef.current) return;
    try {
      sessionStorage.setItem('mtm_map_scale', String(scale));
      sessionStorage.setItem('mtm_map_offset_x', String(offset.x));
      sessionStorage.setItem('mtm_map_offset_y', String(offset.y));
      sessionStorage.setItem('mtm_map_rotation', String(rotation));
      sessionStorage.setItem('mtm_map_focus_mode', String(isFocusMode));
    } catch (_) {}
  }, [scale, offset, rotation, isFocusMode]);

  // Once component is interactive, let normal saves happen
  useEffect(() => {
    const t = setTimeout(() => {
      restoredFromSessionRef.current = true;
    }, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="map-layout-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      onClick={handleBackgroundClick}
    >
      {/* Floating Layer Visibility Checklist Panel at Bottom Left */}
      <div 
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '0px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 80,
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{ fontSize: '9.5px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px', marginBottom: '2px' }}>
          VISIBILITAS LAYER
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-main)', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showParentBuildings}
            onChange={(e) => onToggleParentBuildings(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
          <span>Ged. Utama</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-main)', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showChildBuildings}
            onChange={(e) => onToggleChildBuildings(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
          <span>Ruangan Dalam</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', color: 'var(--text-main)', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={showGateLines}
            onChange={(e) => onToggleGateLines(e.target.checked)}
            style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
          />
          <span>Gerbang / Gate</span>
        </label>
      </div>
      {/* Zoom controls floating on map */}
      {focusBuildingId && (
        <button
          onClick={(e) => { e.stopPropagation(); setFocusBuildingId(null); }}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#f8fafc',
            padding: '8px 16px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            transition: 'background 0.2s',
          }}
        >
          <span>⬅ Kembali ke Area Utama</span>
        </button>
      )}

      <div className="map-controls">
        <button onClick={handleRotate} title="Rotate Map (Putar)" className="control-btn">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25H12m3.75 3.75L12 5.25m3.75 3.75a9 9 0 11-10.428-2.436" />
          </svg>
        </button>
        <button onClick={() => handleReset(true)} title="Reset View" className="control-btn">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        <button onClick={onToggleSettings} title="Buka Pengaturan" className="control-btn">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
          </svg>
        </button>
        <button 
          onClick={() => setIsFocusMode(!isFocusMode)} 
          title={isFocusMode ? "Matikan Mode Fokus" : "Aktifkan Mode Fokus"} 
          className="control-btn"
          style={{
            color: isFocusMode ? 'var(--primary)' : 'inherit',
            backgroundColor: isFocusMode ? 'rgba(59, 130, 246, 0.15)' : 'inherit',
          }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      {/* Floating Settings popup attached next to map-controls */}
      <OpcBar
        isOpen={showSettings}
        onClose={onToggleSettings}
        blueprintOpacity={0}
        onBlueprintOpacityChange={() => {}}
        satelliteOpacity={bgOpacity}
        onSatelliteOpacityChange={onSatelliteOpacityChange}
        shapeOpacity={shapeOpacity}
        onShapeOpacityChange={onShapeOpacityChange}
        showGrid={false}
        onShowGridChange={() => {}}
        showRoads={showRoads}
        onShowRoadsChange={() => {}}
      />

      {/* Zoomable Canvas for Satellite View */}
      <div
        ref={canvasRef}
        className={`layout-canvas ${animateTransform ? 'animate-canvas' : ''}`}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale}) translate(${canvasWidth / 2}px, ${canvasHeight / 2}px) rotate(${rotation}deg) translate(${-canvasWidth / 2}px, ${-canvasHeight / 2}px)`,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Base Satellite Image / Floor Plan with Dynamic Interaction Low-Res Optimization */}
        <img
          src={activeView === 'satellite' ? "/map-img/mtmmap.jpg" : "/map-img/L2.png"}
          alt={activeView === 'satellite' ? "Citra Satelit PT Menara Terus Makmur" : "Layout Dalam Gedung"}
          className="blueprint-underlay"
          style={{ 
            opacity: 1,
            filter: `brightness(${bgOpacity}) ${isInteracting ? 'blur(4px)' : ''}`,
            imageRendering: isInteracting ? 'pixelated' : 'auto',
            transition: isInteracting ? 'none' : 'filter 0.15s ease-out',
            willChange: isInteracting ? 'filter, transform' : 'auto',
          }}
          draggable="false"
        />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="satellite-svg-overlay"
        >
          <defs>
            <pattern
              id="docking-stripes"
              width="2.5"
              height="2.5"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="2.5"
                stroke="rgba(217, 119, 6, 0.55)"
                strokeWidth="0.8"
              />
            </pattern>
            {/* Dynamic hatching patterns for each hatched building */}
            {buildings.filter(b => b.hatched).map((bld) => {
               const baseColor = bld.color || '#3b82f6';
               return (
                 <pattern
                   key={`hatch-pattern-${bld.id}`}
                   id={`hatch-pattern-${bld.id}`}
                   width="3"
                   height="3"
                   patternTransform="rotate(45 0 0)"
                   patternUnits="userSpaceOnUse"
                 >
                   <line x1="0" y1="0" x2="0" y2="3" stroke={baseColor} strokeWidth="0.15" />
                 </pattern>
               );
             })}

            {/* Selection clipPath: even-odd rule punches a hole at the selected polygon.
                The outer rect (0 0 → 100 100) MINUS the selected polygon = only outside is clipped/visible */}
            {selectedBuildingId && (() => {
              const activeBld = buildings.find(b => b.id === selectedBuildingId);
              if (!activeBld) return null;
              // Convert "x,y x,y ..." to SVG path "M x y L x y ... Z"
              const pts = activeBld.points.trim().split(/\s+/).map(p => {
                const [x, y] = p.split(',').map(Number);
                return `${x} ${y}`;
              });
              const innerPath = `M ${pts.join(' L ')} Z`;
              const outerRect  = `M 0 0 L 100 0 L 100 100 L 0 100 Z`;
              return (
                <clipPath id="outside-selected-clip">
                  <path d={`${outerRect} ${innerPath}`} clipRule="evenodd" />
                </clipPath>
              );
            })()}
          </defs>



          {/* Render roads under the buildings with rounded turns */}
          {showRoads && activeView === 'satellite' && (
            <g>
              {/* No custom roads needed on the new mtmmap background */}
            </g>
          )}

          {activeView === 'satellite' && buildings.map((bld, idx) => {
            const isSelected = selectedBuildingId === bld.id;
            const isHovered = hoveredId === bld.id;
            const baseColor = bld.color || '#3b82f6';
            const isFocusedParent = focusBuildingId === bld.id;

            const isChild = bld.parentShapeId && buildings.some(p => p.id === bld.parentShapeId);
            const isAlsoParent = buildings.some(p => p.parentShapeId === bld.id);
            const isParent = !isChild || isAlsoParent;

            // 1. Filter parent building visibility
            if (isParent && !showParentBuildings) return null;

            // 2. Filter child room visibility
            if (isChild && !isAlsoParent) {
              if (focusBuildingId) {
                if (bld.parentShapeId !== focusBuildingId && !isFocusedParent) return null;
              } else {
                if (!showChildBuildings) return null;
              }
            }

            if (isFocusedParent) {
              return (
                <polygon
                  key={`${bld.id}-${idx}`}
                  points={bld.points}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth={0.25}
                  strokeDasharray="0.8,0.8"
                  style={{ pointerEvents: 'none' }}
                />
              );
            }

            if (bld.isGate) return null; // rendered separately at end, on top

            if (bld.isRoad) {
              return (
                <g 
                  key={`${bld.id}-${idx}`}
                  onClick={(e) => handleElementClick(e, bld.id)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    const hasChildren = buildings.some(x => x.parentShapeId === bld.id);
                    if (hasChildren) setFocusBuildingId(bld.id);
                  }}
                  onMouseEnter={() => setHoveredId(bld.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <polyline
                    points={bld.points}
                    fill="none"
                    stroke={baseColor}
                    strokeWidth={isSelected ? 2.2 : 1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeOpacity: isSelected 
                        ? 0.95 
                        : isHovered 
                          ? 0.9 
                          : 0.8
                    }}
                  />
                  <polyline
                    points={bld.points}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={0.18}
                    strokeDasharray="1.0,1.0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeOpacity: isSelected ? 0.98 : 0.9
                    }}
                  />
                </g>
              );
            }

            return (
              <React.Fragment key={`${bld.id}-${idx}`}>
              <polygon
                key={`${bld.id}-${idx}`}
                id={bld.id}
                points={bld.points}
                strokeWidth={isSelected ? 0.35 : 0.16}
                className={`building-polygon ${isSelected ? 'selected' : ''} ${
                  isHovered ? 'hovered' : ''
                } ${bld.icon === 'listrik' ? 'shape-pulse-slow' : ''}`}
                style={{
                  fill: baseColor,
                  stroke: baseColor,
                  fillOpacity: bld.icon === 'listrik'
                    ? undefined
                    : isSelected 
                      ? shapeOpacity * 0.7 
                      : isHovered 
                        ? shapeOpacity * 0.8 
                        : shapeOpacity * 0.45,
                  strokeOpacity: isSelected 
                    ? 1 
                    : isHovered 
                      ? 0.98 
                      : 0.85
                }}
                onClick={(e) => handleElementClick(e, bld.id)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const hasChildren = buildings.some(x => x.parentShapeId === bld.id);
                  if (hasChildren) setFocusBuildingId(bld.id);
                }}
                onMouseEnter={() => setHoveredId(bld.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
               {bld.hatched && (
                 <polygon
                   key={`hatch-${bld.id}-${idx}`}
                   points={bld.points}
                   fill={`url(#hatch-pattern-${bld.id})`}
                   stroke="none"
                   style={{ pointerEvents: 'none', opacity: 0.2 }}
                 />
               )}
            </React.Fragment>
            );
          })}

          {/* Render Icons on Buildings */}
          {activeView === 'satellite' && buildings.map((bld, idx) => {
            if (!bld.icon || !SVG_ICONS[bld.icon]) return null;

            if (focusBuildingId) {
              const isChild = bld.parentShapeId === focusBuildingId;
              if (!isChild) return null;
            } else {
              const isChildShape = bld.parentShapeId && buildings.some(p => p.id === bld.parentShapeId);
              const isAlsoParent = buildings.some(p => p.parentShapeId === bld.id);
              if (isChildShape && !isAlsoParent) return null;
            }

            const coords = bld.points.split(' ').map((p) => p.split(',').map(Number));
            const xs = coords.map((c) => c[0]);
            const ys = coords.map((c) => c[1]);
            const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
            const centerY = (Math.max(...ys) + Math.min(...ys)) / 2;

            const color = bld.color || '#3b82f6';

            return (
              <g
                key={`icon-${bld.id}-${idx}`}
                transform={`translate(${centerX}, ${centerY}) scale(0.12) translate(-12, -12)`}
                fill={color}
                style={{ pointerEvents: 'none' }}
                dangerouslySetInnerHTML={{ __html: SVG_ICONS[bld.icon] }}
              />
            );
          })}

          {/* Dark overlay OUTSIDE selected shape rendered at the end to cover all unselected shapes/roads */}
          {selectedBuildingId && isFocusMode && (
            <rect
              x="0"
              y="0"
              width="100"
              height="100"
              fill="rgba(4, 6, 11, 0.65)"
              clipPath="url(#outside-selected-clip)"
              style={{ pointerEvents: 'none' }}
            />
          )}
          {/* Gate shapes rendered on top of everything else */}
          {showGateLines && activeView === 'satellite' && buildings.filter(b => b.isGate).map((bld, idx) => {
            const isSelected = selectedBuildingId === bld.id;
            const isHovered = hoveredId === bld.id;
            return (
              <g
                key={`gate-${bld.id}-${idx}`}
                onClick={(e) => handleElementClick(e, bld.id)}
                onMouseEnter={() => setHoveredId(bld.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Underlay: orange stroke */}
                <polyline
                  points={bld.points}
                  fill="none"
                  stroke="#ff7800"
                  strokeWidth={isSelected ? 1.0 : 0.65}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeOpacity: isSelected || isHovered ? 1 : 0.9 }}
                />
                {/* Overlay: yellow solid line */}
                <polyline
                  points={bld.points}
                  fill="none"
                  stroke="#ffea00"
                  strokeWidth={isSelected ? 0.55 : 0.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ strokeOpacity: 1 }}
                />
              </g>
            );
          })}


          {mainGate && (
            <g 
              transform={`translate(${mainGate.x}, ${mainGate.y})`}
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBuilding('main-gate');
              }}
            >
              <defs>
                <pattern id="map-gate-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#f59e0b" strokeOpacity="0.3" strokeWidth="1"/>
                </pattern>
              </defs>
              <g transform={`rotate(${mainGate.rotation || 0}) scale(0.045)`}>
                {/* Grid Underlay */}
                <rect x="-38" y="-38" width="76" height="76" fill="url(#map-gate-grid)" stroke="#f59e0b" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3,3" rx="4" />
                {/* Yellow Entrance Line */}
                <line x1="-38" y1="-38" x2="-38" y2="38" stroke="#f59e0b" strokeWidth="4.5" strokeLinecap="round" />
                {/* Entrance Arrow */}
                <path d="M -34 -14 L 6 -14 L 6 -24 L 38 0 L 6 24 L 6 14 L -34 14 Z" 
                      fill="#10b981" 
                      stroke="#ffffff" 
                      strokeWidth="2" />
              </g>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
