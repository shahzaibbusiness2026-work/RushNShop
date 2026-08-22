'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, CheckCircle, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { getTimeframeData, normalizeTimeRange } from '@/lib/timeSeries';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function ProfitHealthCard() {
  const { products, settings, monthlyData, dateRange, theme } = useStore();
  const [mounted, setMounted] = React.useState(false);
  const [selectedSegment, setSelectedSegment] = React.useState<string | null>(null);
  const [hoveredEntry, setHoveredEntry] = React.useState<any>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { kpis, chartPoints } = React.useMemo(() => {
    return getTimeframeData(dateRange, products, settings, monthlyData);
  }, [dateRange, products, settings, monthlyData]);

  const total = products.length;
  const excellentCount = products.filter(p => p.status === 'excellent').length;
  const goodCount = products.filter(p => p.status === 'good').length;
  const lowCount = products.filter(p => p.status === 'low').length;
  const lossCount = products.filter(p => p.status === 'loss').length;

  const data = total > 0 ? [
    { name: 'High Profit', value: excellentCount, percentage: `${Math.round((excellentCount / total) * 100)}%`, color: '#10B981', target: '≥ 35% Margin' },
    { name: 'Medium Profit', value: goodCount, percentage: `${Math.round((goodCount / total) * 100)}%`, color: '#F59E0B', target: '20-35% Margin' },
    { name: 'Low Profit', value: lowCount, percentage: `${Math.round((lowCount / total) * 100)}%`, color: '#F97316', target: '5-20% Margin' },
    { name: 'Loss', value: lossCount, percentage: `${Math.round((lossCount / total) * 100)}%`, color: '#EF4444', target: '< 0% (Negative)' },
  ].filter(d => d.value > 0) : [
    { name: 'No Products', value: 1, percentage: '100%', color: '#94A3B8', target: 'N/A' }
  ];

  // Dynamic health score integrating timeframe profit margin performance
  const portfolioMarginScore = kpis.avgMargin >= (settings.targetProfitMarginPercent || 35) ? 92 : Math.max(40, Math.round(kpis.avgMargin * 2.2));
  const overallHealthScore = total > 0 
    ? Math.round(((((excellentCount * 100) + (goodCount * 80) + (lowCount * 45) + (lossCount * 0)) / total) * 0.6) + (portfolioMarginScore * 0.4))
    : 100;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card flex flex-col justify-between transition-colors">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                Profit Health
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800">
                {dateRange}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Live portfolio margin sustainability & risk index
            </p>
          </div>
        </div>

        {/* Donut Chart and Legend Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mt-2">
          {/* Donut Chart with Dynamic Centered Metric */}
          <div className="relative h-44 flex items-center justify-center">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={data.length > 1 ? 4 : 0}
                    dataKey="value"
                    strokeWidth={0}
                    onMouseEnter={(e) => setHoveredEntry(e)}
                    onMouseLeave={() => setHoveredEntry(null)}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    wrapperStyle={{ zIndex: 1000, pointerEvents: 'none' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const entry = payload[0].payload;
                        return (
                          <div 
                            className="text-slate-900 dark:text-white px-3 py-2 rounded-xl shadow-2xl border-2 text-xs space-y-1 z-50 pointer-events-none transition-all"
                            style={{ 
                              backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                              borderColor: entry.color 
                            }}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                              <span className="text-slate-900 dark:text-white font-bold">{entry.name}</span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-200 font-bold text-[11px]">
                              {entry.value} products ({entry.percentage})
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {entry.target}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-xs text-slate-400">
                Loading gauge...
              </div>
            )}

            {/* Dynamic Center Label - Switches smoothly on slice hover to prevent overlapping text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all">
              {hoveredEntry ? (
                <>
                  <span 
                    className="text-xl font-black leading-none tracking-tight transition-all"
                    style={{ color: hoveredEntry.color }}
                  >
                    {hoveredEntry.percentage}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1 truncate max-w-[80px]">
                    {hoveredEntry.name}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                    {overallHealthScore}%
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {overallHealthScore >= 75 ? 'Healthy' : overallHealthScore >= 50 ? 'Moderate' : 'Needs Work'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-2">
            {data.map((item, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedSegment(selectedSegment === item.name ? null : item.name)}
                className={`flex items-center justify-between text-xs p-2 rounded-xl transition-all cursor-pointer border ${
                  selectedSegment === item.name 
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 font-semibold' 
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-100 dark:hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 block truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{item.target}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white shrink-0">
                  <span>{item.value}</span>
                  <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">({item.percentage})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Contextual Callout */}
      <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-md bg-brand-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
          <Sparkles className="w-3 h-3 text-amber-300" />
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
          {total > 0 
            ? <><strong>{dateRange}:</strong> Realizing <strong className="font-bold text-brand-600 dark:text-brand-400">{formatCurrency(kpis.totalProfit, settings.currencySymbol)}</strong> net profit at <strong className="font-bold text-emerald-600 dark:text-emerald-400">{kpis.avgMargin}%</strong> margin.</>
            : <>Evaluate products in the calculator to populate live portfolio sustainability ratings.</>}
        </p>
      </div>
    </div>
  );
}
