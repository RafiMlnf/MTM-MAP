'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BuildingData, roads } from '../data/mapData';

const SVG_ICONS: Record<string, string> = {
  mesin: `<path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.5.5 0 0 0-.5-.42h-3.84a.5.5 0 0 0-.5.42l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.5.5 0 0 0-.6.22L1.97 8.24a.5.5 0 0 0 .12.64l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.12.22.37.29.6.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.42.5.42h3.84c.24 0 .44-.17.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>`,
  listrik: `<path d="M11.5 2L3 13h7v9l8.5-11h-7z"/>`,
  taman: `<path d="M12 2C7.58 2 4 5.58 4 10c0 2.9 1.54 5.43 3.86 6.86l-.86 3.14h10l-.86-3.14C18.46 15.43 20 12.9 20 10c0-4.42-3.58-8-8-8zm1 14h-2v3h2v-3z"/>`,
  masjid: `<path d="M12 2c.4 0 .7.3.7.7v1.1c2 .2 3.8 1.3 4.8 3.1.2-.1.4-.2.6-.2 1 0 1.9.9 1.9 1.9 0 .4-.1.8-.4 1.1l-1.3 5.4c.5.3.7.8.7 1.4v2.5c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-2.5c0-.6.3-1.1.7-1.4l-1.3-5.4C4.1 9.9 4 9.5 4 9.1c0-1 .9-1.9 1.9-1.9.2 0 .4.1.6.2C7.5 5.6 9.3 4.5 11.3 4.3V2.7c0-.4.3-.7.7-.7zm0 3.3c-3.1 0-5.7 2.3-6.1 5.3h12.2C17.7 7.6 15.1 5.3 12 5.3zM7 16.5v2h2v-2H7zm4 0v2h2v-2h-2zm4 0v2h2v-2h-2z"/>`,
  parkir: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 11h-3v3H8V8h5c1.66 0 3 1.34 3 3s-1.34 3-3 3zm0-4h-3v2h3c.55 0 1-.45 1-1s-.45-1-1-1z"/>`
};

interface MapSatelliteProps {
  buildings: BuildingData[];
  selectedBuildingId: string | null;
  onSelectBuilding: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  bgOpacity: number;
  shapeOpacity: number;
  showRoads: boolean;
  activeView: 'satellite' | 'layout';
  onShowSettings: () => void;
}

export default function MapSatellite({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  hoveredId,
  setHoveredId,
  bgOpacity,
  shapeOpacity,
  showRoads,
  activeView,
  onShowSettings,
}: MapSatelliteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragStartMouseRef = useRef({ x: 0, y: 0 });

  // Zoom & Pan states
  const [scale, setScale] = useState(0.65);
  const [offset, setOffset] = useState({ x: 200, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [animateTransform, setAnimateTransform] = useState(true);

  const scaleRef = useRef(scale);
  const offsetRef = useRef(offset);

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
    const targetZoom = scale;

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      setAnimateTransform(true);
      setOffset({
        x: containerWidth / 2 - targetX * targetZoom,
        y: containerHeight / 2 - targetY * targetZoom,
      });
    }
  }, [selectedBuildingId, buildings]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    dragStartMouseRef.current = { x: e.clientX, y: e.clientY };
    setAnimateTransform(false);
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
    setScale((prev) => Math.max(0.2, prev - 0.25));
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    setOffset((prev) => ({
      x: prev.x + (w / 2 - prev.x) * (0.25 / scale),
      y: prev.y + (h / 2 - prev.y) * (0.25 / scale),
    }));
  };

  const handleReset = useCallback(() => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      return;
    }

    setAnimateTransform(true);
    const baseScale = Math.min(
      (containerWidth - 60) / canvasWidth,
      (containerHeight - 60) / canvasHeight
    );
    setScale(baseScale);
    setOffset({
      x: (containerWidth - canvasWidth * baseScale) / 2,
      y: (containerHeight - canvasHeight * baseScale) / 2,
    });
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
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

      const newScale = Math.max(0.2, Math.min(3.5, currentScale * factor));
      const canvasMouseX = (mouseX - currentOffset.x) / currentScale;
      const canvasMouseY = (mouseY - currentOffset.y) / currentScale;

      const newOffset = {
        x: mouseX - canvasMouseX * newScale,
        y: mouseY - canvasMouseY * newScale,
      };

      // Sync refs immediately to prevent race conditions during rapid scrolling
      scaleRef.current = newScale;
      offsetRef.current = newOffset;

      setScale(newScale);
      setOffset(newOffset);
    };

    if (container) {
      container.addEventListener('wheel', handleWheelEvent, { passive: false });
    }

    const observer = new ResizeObserver(() => {
      handleReset();
    });
    if (container) {
      observer.observe(container);
    }

    // Run immediately on mount
    handleReset();

    // Run after a short delay to ensure layout has settled
    const timer = setTimeout(() => {
      handleReset();
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

  return (
    <div
      className="map-layout-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      onClick={handleBackgroundClick}
    >
      {/* Zoom controls floating on map */}
      <div className="map-controls">
        <button onClick={handleZoomIn} title="Zoom In" className="control-btn">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" className="control-btn">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>
        <button onClick={handleReset} title="Reset View" className="control-btn">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        <button onClick={onShowSettings} title="Buka Pengaturan" className="control-btn">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
          </svg>
        </button>
      </div>

      {/* Zoomable Canvas for Satellite View */}
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
        {/* Base Satellite Image / Floor Plan */}
        <img
          src={activeView === 'satellite' ? "/map-img/mtmmap.jpg" : "/map-img/L2.png"}
          alt={activeView === 'satellite' ? "Citra Satelit PT Menara Terus Makmur" : "Layout Dalam Gedung"}
          className="blueprint-underlay"
          style={{ opacity: bgOpacity }}
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

            return (
              <polygon
                key={`${bld.id}-${idx}`}
                id={bld.id}
                points={bld.points}
                className={`building-polygon ${isSelected ? 'selected' : ''} ${
                  isHovered ? 'hovered' : ''
                }`}
                style={{
                  fill: baseColor,
                  stroke: baseColor,
                  fillOpacity: isSelected 
                    ? shapeOpacity * 0.4 
                    : isHovered 
                      ? shapeOpacity * 0.5 
                      : shapeOpacity * 0.2,
                  strokeOpacity: isSelected 
                    ? 1 
                    : isHovered 
                      ? 0.9 
                      : 0.6
                }}
                onClick={(e) => handleElementClick(e, bld.id)}
                onMouseEnter={() => setHoveredId(bld.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}

          {/* Render Icons on Buildings */}
          {activeView === 'satellite' && buildings.map((bld, idx) => {
            if (!bld.icon || !SVG_ICONS[bld.icon]) return null;

            const coords = bld.points.split(' ').map((p) => p.split(',').map(Number));
            const xs = coords.map((c) => c[0]);
            const ys = coords.map((c) => c[1]);
            const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
            const centerY = (Math.max(...ys) + Math.min(...ys)) / 2;

            const isSelected = selectedBuildingId === bld.id;
            const isHovered = hoveredId === bld.id;
            const color = isSelected ? '#10b981' : (isHovered ? '#1d4ed8' : 'rgba(29, 78, 216, 0.75)');

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

          {/* Main Entrance Green Arrow, Yellow Gate, & Label */}
          {activeView === 'satellite' && (
            <g className="entrance-overlay">
              <polygon
                points="36,84.8 35.2,86.5 35.7,86.5 35.7,87.3 36.3,87.3 36.3,86.5 36.8,86.5"
                fill="#10b981"
                stroke="#047857"
                strokeWidth="0.1"
              />
              {/* Yellow Gate Line */}
              <line
                x1="34.5"
                y1="87.6"
                x2="37.5"
                y2="87.6"
                stroke="#fbbf24"
                strokeWidth="0.35"
                strokeLinecap="round"
              />
              <text
                x="36"
                y="89.5"
                fill="#047857"
                fontSize="1.3"
                fontWeight="bold"
                textAnchor="middle"
                style={{ letterSpacing: '0.1px', fontFamily: 'Inter, sans-serif' }}
              >
                PINTU MASUK
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
