'use client';

import React, { useState, useRef, useEffect } from 'react';
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
}: MapSatelliteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan states
  const [scale, setScale] = useState(0.65);
  const [offset, setOffset] = useState({ x: 200, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [animateTransform, setAnimateTransform] = useState(true);

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
    const targetZoom = 1.2;

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      setAnimateTransform(true);
      setScale(targetZoom);
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

  const handleReset = () => {
    if (!containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    if (containerWidth === 0 || containerHeight === 0) {
      // Fallback scale/offset instead of calculating negative numbers during initial mount
      setScale(0.2);
      setOffset({ x: 200, y: 50 });
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
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    const container = containerRef.current;
    
    // Manual non-passive wheel event listener to support touchpad controls
    const handleWheelEvent = (e: WheelEvent) => {
      e.preventDefault();
      if (!container) return;

      if (e.ctrlKey) {
        // Zoom (pinch-to-zoom or Ctrl + Scroll)
        const zoomIntensity = 0.0015;
        const factor = Math.exp(-e.deltaY * zoomIntensity);

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        setAnimateTransform(false);
        setScale((prevScale) => {
          const newScale = Math.max(0.2, Math.min(3.5, prevScale * factor));
          setOffset((prevOffset) => {
            const canvasMouseX = (mouseX - prevOffset.x) / prevScale;
            const canvasMouseY = (mouseY - prevOffset.y) / prevScale;
            return {
              x: mouseX - canvasMouseX * newScale,
              y: mouseY - canvasMouseY * newScale,
            };
          });
          return newScale;
        });
      } else {
        // Pan (2-finger touchpad scroll or regular scroll)
        setAnimateTransform(false);
        setOffset((prevOffset) => ({
          x: prevOffset.x - e.deltaX,
          y: prevOffset.y - e.deltaY,
        }));
      }
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

    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      if (container) {
        container.removeEventListener('wheel', handleWheelEvent);
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div
      className="map-layout-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
      onClick={() => onSelectBuilding('')}
    >
      {/* Zoom controls floating on map */}
      <div className="map-controls">
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
        {/* Base Satellite Image */}
        <img
          src="/map-img/mtmmap.jpg"
          alt="Citra Satelit PT Menara Terus Makmur"
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
          {showRoads && (
            <g>
              {/* No custom roads needed on the new mtmmap background */}
            </g>
          )}

          {buildings.map((bld, idx) => {
            const isSelected = selectedBuildingId === bld.id;
            const isHovered = hoveredId === bld.id;

            return (
              <polygon
                key={`${bld.id}-${idx}`}
                id={bld.id}
                points={bld.points}
                className={`building-polygon ${isSelected ? 'selected' : ''} ${
                  isHovered ? 'hovered' : ''
                }`}
                style={{
                  fill: isSelected 
                    ? `rgba(4, 120, 87, ${shapeOpacity * 0.24})` 
                    : isHovered 
                      ? `rgba(29, 78, 216, ${shapeOpacity * 0.36})` 
                      : `rgba(29, 78, 216, ${shapeOpacity * 0.1})`,
                  stroke: isSelected 
                    ? `rgba(16, 185, 129, ${shapeOpacity})` 
                    : isHovered 
                      ? `rgba(29, 78, 216, ${shapeOpacity})` 
                      : `rgba(29, 78, 216, ${shapeOpacity * 0.8})`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBuilding(bld.id);
                }}
                onMouseEnter={() => setHoveredId(bld.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            );
          })}

          {/* Render Icons on Buildings */}
          {buildings.map((bld, idx) => {
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
        </svg>

        {/* Labels/Badges positioned dynamically */}
        {buildings.map((bld, idx) => {
          const coords = bld.points.split(' ').map((p) => p.split(',').map(Number));
          const xs = coords.map((c) => c[0]);
          const ys = coords.map((c) => c[1]);
          const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
          const centerY = (Math.max(...ys) + Math.min(...ys)) / 2;

          const isTopRow = centerY < 4;

          return (
            <div
              key={`label-${bld.id}-${idx}`}
              className={`building-badge-label ${
                selectedBuildingId === bld.id ? 'active' : ''
              } ${hoveredId === bld.id ? 'hovered' : ''}`}
              style={{
                left: `${centerX}%`,
                top: isTopRow ? `${Math.min(...ys)}%` : `${centerY}%`,
                transform: isTopRow ? 'translate(-50%, -125%)' : 'translate(-50%, -50%)',
                position: 'absolute',
                zIndex: 10,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectBuilding(bld.id);
              }}
              onMouseEnter={() => setHoveredId(bld.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="badge-code">{bld.code.split(' ')[0]} {bld.code.split(' ')[1] || ''}</div>
              <div className="badge-tooltip">{bld.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
