'use client';

import React, { useState } from 'react';

export interface ChartDataPoint {
  label: string;
  timestamp: string;
  posts: number;
  replies: number;
  reactions: number;
  visitors: number;
}

interface AdminChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
}

export default function AdminChart({
  data,
  title = 'Tren Aktivitas Komunitas',
  subtitle = 'Statistik posting, balasan, dan reaksi berdasarkan waktu riil database',
}: AdminChartProps) {
  const [activeSeries, setActiveSeries] = useState<{
    posts: boolean;
    replies: boolean;
    reactions: boolean;
    visitors: boolean;
  }>({
    posts: true,
    replies: true,
    reactions: true,
    visitors: true,
  });

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 font-sans text-xs">
        Belum ada data aktivitas yang terekam pada rentang waktu ini.
      </div>
    );
  }

  // Calculate maximum value across visible series
  const maxVal = Math.max(
    1,
    ...data.map((d) => {
      const vals: number[] = [];
      if (activeSeries.posts) vals.push(d.posts);
      if (activeSeries.replies) vals.push(d.replies);
      if (activeSeries.reactions) vals.push(d.reactions);
      if (activeSeries.visitors) vals.push(d.visitors);
      return Math.max(0, ...vals);
    })
  );

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const paddingX = 40;
  const paddingY = 25;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const getX = (index: number) => {
    if (data.length <= 1) return paddingX + chartWidth / 2;
    return paddingX + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const ratio = val / (maxVal * 1.15);
    return paddingY + chartHeight - ratio * chartHeight;
  };

  const buildPath = (key: 'posts' | 'replies' | 'reactions' | 'visitors') => {
    return data
      .map((d, i) => {
        const x = getX(i);
        const y = getY(d[key]);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const buildAreaPath = (key: 'posts' | 'replies' | 'reactions' | 'visitors') => {
    const linePath = data
      .map((d, i) => `${getX(i).toFixed(1)} ${getY(d[key]).toFixed(1)}`)
      .join(' L ');
    const lastX = getX(data.length - 1).toFixed(1);
    const firstX = getX(0).toFixed(1);
    const bottomY = (paddingY + chartHeight).toFixed(1);
    return `M ${firstX} ${bottomY} L ${linePath} L ${lastX} ${bottomY} Z`;
  };

  const seriesMeta = [
    { key: 'posts', label: 'Coretan Baru', color: '#4F46E5', fill: 'rgba(79, 70, 229, 0.08)' },
    { key: 'replies', label: 'Balasan Diskusi', color: '#059669', fill: 'rgba(5, 150, 105, 0.08)' },
    { key: 'reactions', label: 'Reaksi Emosional', color: '#D97706', fill: 'rgba(217, 119, 6, 0.08)' },
    { key: 'visitors', label: 'Sesi Pengunjung', color: '#0284C7', fill: 'rgba(2, 132, 199, 0.08)' },
  ];

  const hoveredData = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* Header & Series Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-sans font-bold text-sm sm:text-base text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>
        </div>

        {/* Series filters */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {seriesMeta.map((s) => {
            const isChecked = (activeSeries as any)[s.key];
            return (
              <button
                key={s.key}
                type="button"
                onClick={() =>
                  setActiveSeries((prev) => ({ ...prev, [s.key]: !(prev as any)[s.key] }))
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                  isChecked
                    ? 'bg-slate-50 text-slate-900 border-slate-300 shadow-xs'
                    : 'bg-white text-slate-400 border-slate-200 line-through opacity-60'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isChecked ? s.color : '#94a3b8' }}
                />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-56 select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="gradient-posts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="gradient-replies" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + chartHeight * (1 - pct);
            const val = Math.round(maxVal * 1.15 * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="sans-serif"
                  fill="#94a3b8"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Areas & Lines */}
          {activeSeries.posts && (
            <>
              <path d={buildAreaPath('posts')} fill="url(#gradient-posts)" />
              <path d={buildPath('posts')} fill="none" stroke="#4F46E5" strokeWidth="2.5" />
            </>
          )}

          {activeSeries.replies && (
            <>
              <path d={buildAreaPath('replies')} fill="url(#gradient-replies)" />
              <path d={buildPath('replies')} fill="none" stroke="#059669" strokeWidth="2.5" />
            </>
          )}

          {activeSeries.reactions && (
            <path
              d={buildPath('reactions')}
              fill="none"
              stroke="#D97706"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
          )}

          {activeSeries.visitors && (
            <path d={buildPath('visitors')} fill="none" stroke="#0284C7" strokeWidth="2" />
          )}

          {/* Interactive vertical hover line and dots */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={getX(hoveredIndex)}
                y1={paddingY}
                x2={getX(hoveredIndex)}
                y2={paddingY + chartHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {activeSeries.posts && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(data[hoveredIndex].posts)}
                  r="4"
                  fill="#4F46E5"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
              {activeSeries.replies && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(data[hoveredIndex].replies)}
                  r="4"
                  fill="#059669"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
              {activeSeries.reactions && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(data[hoveredIndex].reactions)}
                  r="4"
                  fill="#D97706"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
              {activeSeries.visitors && (
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(data[hoveredIndex].visitors)}
                  r="4"
                  fill="#0284C7"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Invisible interactive hover rects */}
          {data.map((_, i) => {
            const x = getX(i) - (chartWidth / data.length) / 2;
            const w = chartWidth / data.length;
            return (
              <rect
                key={i}
                x={Math.max(0, x)}
                y={paddingY}
                width={Math.max(10, w)}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-pointer"
              />
            );
          })}

          {/* X Axis Labels */}
          {data.map((d, i) => {
            // Show label for first, last, and every step
            const step = data.length > 10 ? 2 : 1;
            if (i % step !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={getX(i)}
                y={svgHeight - 6}
                textAnchor="middle"
                fontSize="10"
                fontFamily="sans-serif"
                fill="#64748b"
              >
                {d.label}
              </text>
            );
          })}
        </svg>

        {/* Hover detail tooltip card */}
        {hoveredData && (
          <div className="mt-3 p-3 rounded-lg bg-slate-900 text-white text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="font-mono text-slate-400 font-semibold">
              Waktu: <span className="text-white font-bold">{hoveredData.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {activeSeries.posts && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-slate-300">Coretan:</span>
                  <span className="font-bold font-mono">{hoveredData.posts}</span>
                </div>
              )}
              {activeSeries.replies && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">Balasan:</span>
                  <span className="font-bold font-mono">{hoveredData.replies}</span>
                </div>
              )}
              {activeSeries.reactions && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-slate-300">Reaksi:</span>
                  <span className="font-bold font-mono">{hoveredData.reactions}</span>
                </div>
              )}
              {activeSeries.visitors && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span className="text-slate-300">Pengunjung:</span>
                  <span className="font-bold font-mono">{hoveredData.visitors}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
