'use client';

import React, { useMemo } from 'react';
import { ZoneData, BuildingData } from '../data/mapData';

interface StatsOverviewProps {
  buildings: BuildingData[];
  zones: ZoneData[];
}

export default function StatsOverview({ buildings, zones }: StatsOverviewProps) {
  // Aggregate stats dynamically
  const stats = useMemo(() => {
    let totalMachines = 0;
    let running = 0;
    let idle = 0;
    let maintenance = 0;
    let sumEfficiency = 0;
    let machinesWithEffCount = 0;
    const activeOperators = new Set<string>();

    zones.forEach((zone) => {
      zone.machines.forEach((mach) => {
        totalMachines++;
        if (mach.status === 'running') running++;
        else if (mach.status === 'idle') idle++;
        else if (mach.status === 'maintenance') maintenance++;

        if (mach.status !== 'maintenance') {
          sumEfficiency += mach.efficiency;
          machinesWithEffCount++;
        }

        if (mach.operator && !mach.operator.includes('Teknisi')) {
          activeOperators.add(mach.operator);
        }
      });
    });

    const averageOEE = machinesWithEffCount > 0 ? Math.round(sumEfficiency / machinesWithEffCount) : 0;
    const totalArea = buildings.reduce((acc, b) => acc + b.area, 0);

    return {
      totalMachines,
      running,
      idle,
      maintenance,
      averageOEE,
      totalArea,
      operatorCount: activeOperators.size,
    };
  }, [buildings, zones]);

  return (
    <div className="stats-overview-container">
      {/* KPI Card 1: Average OEE */}
      <div className="kpi-card hover-glow">
        <div className="kpi-icon-wrapper oee">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Rata-rata OEE Pabrik</span>
          <div className="kpi-value-row">
            <span className="kpi-val text-emerald-400">{stats.averageOEE}%</span>
            <span className="kpi-trend text-emerald-500">↑ 1.2%</span>
          </div>
        </div>
      </div>

      {/* KPI Card 2: Machine Status */}
      <div className="kpi-card hover-glow">
        <div className="kpi-icon-wrapper machines">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.68-.3-1.43-.82-2.07-1.46a7.5 7.5 0 01-2.12-5.3M10.34 15.84a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM10.34 15.84c.68-.3 1.43-.82 2.07-1.46m0 0a7.5 7.5 0 015.3-2.12m-5.3 2.12a3.75 3.75 0 110-7.5 3.75 3.75 0 010 7.5zm0-7.5c.3-.68.82-1.43 1.46-2.07M13.5 3.75a7.5 7.5 0 015.3 2.12M13.5 3.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" />
          </svg>
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Status Operasional Mesin</span>
          <div className="kpi-status-breakdown">
            <div className="status-mini-count running" title="Running">
              <span className="dot bg-emerald" />
              <span>{stats.running}</span>
            </div>
            <div className="status-mini-count idle" title="Idle">
              <span className="dot bg-amber" />
              <span>{stats.idle}</span>
            </div>
            <div className="status-mini-count maintenance" title="Repair">
              <span className="dot bg-rose" />
              <span>{stats.maintenance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Card 3: Operators */}
      <div className="kpi-card hover-glow">
        <div className="kpi-icon-wrapper staff">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.962 5.962 0 00-.29-1.898m0 0a5.002 5.002 0 00-13.12 0m0 0c.09.6.27 1.18.52 1.72M18 10.5a3 3 0 11-6 0 3 3 0 016 0zm-6-3a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Operator Aktif Shift</span>
          <div className="kpi-value-row">
            <span className="kpi-val text-blue-400">{stats.operatorCount} orang</span>
            <span className="kpi-label-sub">di Lantai Produksi</span>
          </div>
        </div>
      </div>

      {/* KPI Card 4: Total Area */}
      <div className="kpi-card hover-glow">
        <div className="kpi-icon-wrapper area">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zM12 3.75v16.5M3.75 12h16.5" />
          </svg>
        </div>
        <div className="kpi-info">
          <span className="kpi-label">Total Luas Area Pabrik</span>
          <div className="kpi-value-row">
            <span className="kpi-val text-zinc-300">{stats.totalArea.toLocaleString('id-ID')} m²</span>
            <span className="kpi-label-sub">6 Bangunan/Fasilitas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
