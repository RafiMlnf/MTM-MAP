'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BuildingData, roads } from '../data/mapData';

interface MapSatelliteProps {
  buildings: BuildingData[];
  selectedBuildingId: string | null;
  onSelectBuilding: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  bgOpacity: number;
  showRoads: boolean;
}

export default function MapSatellite({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  hoveredId,
  setHoveredId,
  bgOpacity,
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

  const canvasWidth = 1080;
  const canvasHeight = 1350;

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

  // Handle Zoom on Wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomIntensity = 0.1;
    const mouseX = e.clientX - containerRef.current.getBoundingClientRect().left;
    const mouseY = e.clientY - containerRef.current.getBoundingClientRect().top;

    const canvasMouseX = (mouseX - offset.x) / scale;
    const canvasMouseY = (mouseY - offset.y) / scale;

    const delta = -e.deltaY;
    const newScale = Math.max(0.2, Math.min(3.5, scale + (delta > 0 ? 1 : -1) * zoomIntensity * scale));

    const newOffsetX = mouseX - canvasMouseX * newScale;
    const newOffsetY = mouseY - canvasMouseY * newScale;

    setAnimateTransform(false);
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

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

  useEffect(() => {
    handleReset();
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
          src="/map-img/L1.png"
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
              {/* 2. West Access Lane (Connected to Bottom, Ends at Cutting Area) */}
              <path
                d="M 36,23 L 36,86.1"
                className="road-polygon"
                style={{ strokeWidth: 3.0, strokeLinecap: 'round' }}
              />
              <path
                d="M 36,23 L 36,86.1"
                className="road-marking"
                style={{ strokeWidth: 0.12 }}
              />

              {/* 3. Combined East Access Lane & South Lane (with rounded turn in front of Masjid) */}
              <path
                d="M 2,86.1 L 69.1,86.1 Q 71.1,86.1 71.1,84.1 L 71.1,12"
                className="road-polygon"
                style={{ strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                fill="none"
              />
              <path
                d="M 2,86.1 L 69.1,86.1 Q 71.1,86.1 71.1,84.1 L 71.1,12"
                className="road-marking"
                style={{ strokeWidth: 0.12, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                fill="none"
              />

              {/* 4. Docking Area Connector Road (Runs horizontally to East Lane near Prod 3) */}
              <path
                d="M 36,57 L 71.1,57"
                className="road-polygon"
                style={{ strokeWidth: 2.2, strokeLinecap: 'round' }}
                fill="none"
              />
              <path
                d="M 36,57 L 71.1,57"
                className="road-marking"
                style={{ strokeWidth: 0.12 }}
                fill="none"
              />
            </g>
          )}

          {buildings.map((bld) => {
            const isSelected = selectedBuildingId === bld.id;
            const isHovered = hoveredId === bld.id;

            return (
              <polygon
                key={bld.id}
                id={bld.id}
                points={bld.points}
                className={`building-polygon ${isSelected ? 'selected' : ''} ${
                  isHovered ? 'hovered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBuilding(bld.id);
                }}
                onMouseEnter={() => setHoveredId(bld.id)}
                onMouseLeave={() => setHoveredId(null)}
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
        {buildings.map((bld) => {
          const coords = bld.points.split(' ').map((p) => p.split(',').map(Number));
          const xs = coords.map((c) => c[0]);
          const ys = coords.map((c) => c[1]);
          const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
          const centerY = (Math.max(...ys) + Math.min(...ys)) / 2;

          return (
            <div
              key={`label-${bld.id}`}
              className={`building-badge-label ${
                selectedBuildingId === bld.id ? 'active' : ''
              } ${hoveredId === bld.id ? 'hovered' : ''}`}
              style={{
                left: `${centerX}%`,
                top: `${centerY}%`,
                transform: 'translate(-50%, -50%)',
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
