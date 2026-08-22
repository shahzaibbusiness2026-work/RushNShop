'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ChevronDown, Sparkles, ExternalLink, TrendingUp } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { getTimeframeData } from '@/lib/timeSeries';

export default function ProfitOverviewChart() {
  const { products, monthlyData, settings, theme, dateRange, setDateRange } = useStore();
  const [timeRange, setTimeRange] = useState(dateRange || 'Last 30 Days (Month)');
  const [metricView, setMetricView] = useState<'profit' | 'both' | 'margin'>('profit');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (dateRange) {
      setTimeRange(dateRange);
    }
  }, [dateRange]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const timeRanges = [
    'Today (24h)',
    'Last 7 Days (Week)',
    'Last 30 Days (Month)',
    'This Quarter (3 Months)',
    'Last 12 Months (Year)',
    'All Time (Years)',
  ];

  const { chartPoints, peakProfit, kpis } = React.useMemo(() => {
    return getTimeframeData(timeRange, products, settings, monthlyData);
  }, [timeRange, products, settings, monthlyData]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card flex flex-col justify-between transition-colors overflow-hidden">
      {/* Systematic 2-Tier Header Grid (Prevents any control overlap across all screen widths) */}
      <div className="flex flex-col gap-3 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        {/* Tier 1: Title & Trend on Left, Segmented Control on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
              Profit Overview
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50 shrink-0">
              <TrendingUp className="w-3 h-3" />
              {kpis.profitChange}
            </span>
          </div>

          {/* 1. Metric Segmented Control (Height: 32px / h-8) */}
          <div className="h-8 flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setMetricView('profit')}
              className={`h-7 px-3 text-xs font-semibold rounded-lg transition-all ${
                metricView === 'profit'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Profit
            </button>
            <button
              onClick={() => setMetricView('both')}
              className={`h-7 px-3 text-xs font-semibold rounded-lg transition-all ${
                metricView === 'both'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Rev & Profit
            </button>
            <button
              onClick={() => setMetricView('margin')}
              className={`h-7 px-3 text-xs font-semibold rounded-lg transition-all ${
                metricView === 'margin'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Margin %
            </button>
          </div>
        </div>

        {/* Tier 2: Subtitle Context on Left, Date Selector & View In New Tab on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {timeRange} net earnings & margin trajectory
          </p>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {/* 2. Date Range Dropdown Selector (Height: 32px / h-8) */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-8 flex items-center gap-1.5 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs"
              >
                <span>{timeRange}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setDateRange(range);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. View in New Tab Button (Height: 32px / h-8) */}
            <a
              href="/analytics"
              target="_blank"
              rel="noopener noreferrer"
              title="Open Expanded Analytics Studio in New Tab"
              className="h-8 flex items-center gap-1.5 px-3 bg-brand-50 dark:bg-brand-950 hover:bg-brand-100 dark:hover:bg-brand-900/80 text-brand-700 dark:text-brand-300 text-xs font-bold rounded-xl border border-brand-200/80 dark:border-brand-800/80 transition-all shadow-2xs group shrink-0"
            >
              <span>View in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="h-72 sm:h-80 w-full relative">
        {mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartPoints}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={theme === 'dark' ? 0.45 : 0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={theme === 'dark' ? 0.35 : 0.2} />
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="marginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={theme === 'dark' ? 0.4 : 0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} 
              />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 11 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 11 }}
                tickFormatter={(val) => 
                  metricView === 'margin'
                    ? `${val}%`
                    : `${settings.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`
                }
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 border border-slate-200/80 dark:border-slate-800 z-50">
                        <p className="font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-1">{data.label}</p>
                        <div className="space-y-1 pt-0.5">
                          <p className="text-brand-600 dark:text-brand-400 font-semibold flex items-center justify-between gap-4">
                            <span>Net Profit:</span>
                            <span className="font-bold">{formatCurrency(data.profit, settings.currencySymbol)}</span>
                          </p>
                          <p className="text-cyan-600 dark:text-cyan-400 font-medium flex items-center justify-between gap-4">
                            <span>Gross Revenue:</span>
                            <span className="font-bold">{formatCurrency(data.revenue, settings.currencySymbol)}</span>
                          </p>
                          <p className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-between gap-4">
                            <span>Profit Margin:</span>
                            <span className="font-bold">{data.margin}%</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {metricView === 'both' && (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#revGradient)"
                />
              )}

              {metricView !== 'margin' ? (
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#profitGradient)"
                  activeDot={{ r: 6, fill: '#6366F1', stroke: theme === 'dark' ? '#0F172A' : '#FFFFFF', strokeWidth: 3 }}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="margin"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#marginGradient)"
                  activeDot={{ r: 6, fill: '#10B981', stroke: theme === 'dark' ? '#0F172A' : '#FFFFFF', strokeWidth: 3 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-xs text-slate-400">
            Loading chart...
          </div>
        )}

        {/* Peak Indicator Badge */}
        {peakProfit > 0 && metricView !== 'margin' && (
          <div className="absolute top-2 right-4 bg-brand-50/90 dark:bg-brand-950/90 backdrop-blur-xs border border-brand-200/80 dark:border-brand-800/80 text-brand-700 dark:text-brand-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Peak: {formatCurrency(peakProfit, settings.currencySymbol)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
