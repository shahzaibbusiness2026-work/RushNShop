'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Layers, 
  DollarSign, 
  Percent, 
  Sparkles, 
  ArrowUpRight, 
  FileSpreadsheet, 
  Printer, 
  Download,
  Calendar,
  ChevronDown,
  Activity,
  Maximize2
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { exportToGoogleSheetsCSV, copyForGoogleSheets } from '@/lib/exportUtils';
import { getTimeframeData } from '@/lib/timeSeries';
import PdfReportModal from '@/components/export/PdfReportModal';

export default function AnalyticsPage() {
  const { products, settings, monthlyData, dateRange, setDateRange, theme, showToast } = useStore();
  const [mounted, setMounted] = React.useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState(dateRange || 'Last 30 Days (Month)');
  const [chartType, setChartType] = useState<'area' | 'bar' | 'composed'>('area');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (dateRange) {
      setSelectedTimeRange(dateRange);
    }
  }, [dateRange]);

  const timeRanges = [
    'Today (24h)',
    'Last 7 Days (Week)',
    'Last 30 Days (Month)',
    'This Quarter (3 Months)',
    'Last 12 Months (Year)',
    'All Time (Years)',
  ];

  const { chartPoints, peakProfit, kpis } = React.useMemo(() => {
    return getTimeframeData(selectedTimeRange, products, settings, monthlyData);
  }, [selectedTimeRange, products, settings, monthlyData]);

  // Enriched data points with fees and ad spend
  const studioData = chartPoints.map(pt => {
    const fees = Math.round(pt.revenue * 0.12);
    const ads = Math.round(pt.revenue * 0.14);
    const cogs = Math.round(pt.revenue * 0.40);
    return {
      ...pt,
      fees,
      ads,
      cogs,
    };
  });

  const categoryMarginData = [
    { category: 'Tech & Gadgets', margin: 38.6, revenue: Math.round(kpis.totalRevenue * 0.42), color: '#6366F1' },
    { category: 'Beauty & Lifestyle', margin: 44.2, revenue: Math.round(kpis.totalRevenue * 0.31), color: '#10B981' },
    { category: 'Home & Kitchen', margin: 32.5, revenue: Math.round(kpis.totalRevenue * 0.18), color: '#F59E0B' },
    { category: 'Accessories', margin: 28.0, revenue: Math.round(kpis.totalRevenue * 0.09), color: '#06B6D4' },
  ];

  const waterfallData = [
    { name: 'Gross Revenue', amount: 100, fill: '#6366F1' },
    { name: 'Supplier Product Cost', amount: -38, fill: '#818CF8' },
    { name: 'Shipping & Logistics', amount: -10, fill: '#94A3B8' },
    { name: `TikTok Fees (${settings.tiktokCommissionPercent + settings.transactionFeePercent}%)`, amount: -12, fill: '#F59E0B' },
    { name: 'Affiliate & Ads CAC', amount: -14, fill: '#F43F5E' },
    { name: 'Net Profit Realized', amount: 26, fill: '#10B981' },
  ];

  const handleExportGoogleSheets = () => {
    const data = studioData.map(c => ({
      'Time Period': c.label,
      'Net Profit': c.profit,
      'Gross Revenue': c.revenue,
      'Estimated Fees': c.fees,
      'Marketing CAC': c.ads,
      'Margin (%)': `${c.margin}%`,
    }));
    exportToGoogleSheetsCSV(`RushNshop-Analytics-Trajectory-${Date.now()}`, data);
    showToast('Exported to Google Sheets', 'Time-series trajectory downloaded as Google Sheets CSV.', 'success');
  };

  const handleCopyGoogleSheets = () => {
    const data = studioData.map(c => ({
      'Period': c.label,
      'Profit': `${settings.currencySymbol}${c.profit}`,
      'Revenue': `${settings.currencySymbol}${c.revenue}`,
      'Margin': `${c.margin}%`,
    }));
    const success = copyForGoogleSheets(data);
    if (success) {
      showToast('Copied to Clipboard', 'Time-series data copied (Ctrl+V into Google Sheets).', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Expanded Graph Studio & Profit Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Full-screen interactive visualizer for financial trajectory, TikTok fees, and margin sustainability curves.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe selector */}
          <div className="relative">
            <button
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedTimeRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                {timeRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedTimeRange(range);
                      setDateRange(range);
                      setDateDropdownOpen(false);
                      showToast('Timeframe Updated', `Visualizing: ${range}`, 'info');
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                      selectedTimeRange === range
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

          <button
            onClick={handleCopyGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
            title="Copy for Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copy Google Sheets</span>
          </button>

          <button
            onClick={handleExportGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Export</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Graph Studio Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Revenue, Profit & Fee Distribution ({selectedTimeRange})
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                Peak: {formatCurrency(peakProfit, settings.currencySymbol)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Comparing Net Earnings vs Gross Revenue vs TikTok Platform Fees & Ad Spend
            </p>
          </div>

          {/* Chart View Mode Controls */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                chartType === 'area'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Area Flow
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                chartType === 'bar'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Bar Comparison
            </button>
            <button
              onClick={() => setChartType('composed')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                chartType === 'composed'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Multi-Metric Curve
            </button>
          </div>
        </div>

        {/* Big Interactive Chart Viewport */}
        <div className="h-80 sm:h-96 w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={studioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(val) => `${settings.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                            <p className="font-bold text-slate-200">{d.label}</p>
                            <p className="text-emerald-400 font-semibold">Net Profit: {formatCurrency(d.profit, settings.currencySymbol)}</p>
                            <p className="text-cyan-300">Revenue: {formatCurrency(d.revenue, settings.currencySymbol)}</p>
                            <p className="text-amber-400">TikTok Fees: {formatCurrency(d.fees, settings.currencySymbol)}</p>
                            <p className="text-rose-400">Marketing CAC: {formatCurrency(d.ads, settings.currencySymbol)}</p>
                            <p className="text-brand-300">Margin: {d.margin}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Gross Revenue" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="fees" name="TikTok Fees" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ads" name="Ad CAC" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : chartType === 'composed' ? (
                <LineChart data={studioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(val) => `${settings.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                            <p className="font-bold text-slate-200">{d.label}</p>
                            <p className="text-emerald-400 font-semibold">Net Profit: {formatCurrency(d.profit, settings.currencySymbol)}</p>
                            <p className="text-cyan-300">Revenue: {formatCurrency(d.revenue, settings.currencySymbol)}</p>
                            <p className="text-brand-300">Margin: {d.margin}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#06B6D4" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#6366F1" strokeWidth={3} dot={{ r: 5 }} />
                  <Line type="monotone" dataKey="fees" name="TikTok Fees" stroke="#F59E0B" strokeWidth={2} strokeDasharray="3 3" />
                </LineChart>
              ) : (
                <AreaChart data={studioData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studioProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="studioRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} tickFormatter={(val) => `${settings.currencySymbol}${val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val}`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                            <p className="font-bold text-slate-200">{d.label}</p>
                            <p className="text-emerald-400 font-semibold">Net Profit: {formatCurrency(d.profit, settings.currencySymbol)}</p>
                            <p className="text-cyan-300">Revenue: {formatCurrency(d.revenue, settings.currencySymbol)}</p>
                            <p className="text-brand-300">Margin: {d.margin}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#06B6D4" strokeWidth={2} fill="url(#studioRev)" />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#6366F1" strokeWidth={3} fill="url(#studioProfit)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-400">
              Loading interactive visualizer...
            </div>
          )}
        </div>
      </div>

      {/* Grid: Category Margins & Profit Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance Bar Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Margin by Category</h3>
              <p className="text-xs text-slate-400">Average profit margin percentage per vertical</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-200/40 dark:border-emerald-800/40">
              Top: Beauty & Lifestyle (44.2%)
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryMarginData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
                  <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#64748B' : '#94A3B8', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip 
                    formatter={(val: any) => [`${val}%`, 'Profit Margin']}
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                      borderColor: theme === 'dark' ? '#1E293B' : '#E2E8F0',
                      borderRadius: '12px',
                      color: theme === 'dark' ? '#FFFFFF' : '#0F172A',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="margin" radius={[8, 8, 0, 0]}>
                    {categoryMarginData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full bg-slate-50/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-xs text-slate-400">
                Loading analytics...
              </div>
            )}
          </div>
        </div>

        {/* 100% Revenue Distribution Waterfall Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Average $100 Order Waterfall</h3>
              <p className="text-xs text-slate-400">Where every dollar goes across your TikTok operations</p>
            </div>
          </div>

          <div className="space-y-3.5 mt-4">
            {waterfallData.map((item, idx) => {
              const isPositive = item.amount > 0;
              const isProfit = item.name.includes('Net Profit');

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className={isProfit ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : isPositive ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>
                      {isPositive ? `+$${item.amount}` : `-$${Math.abs(item.amount)}`}
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, Math.abs(item.amount))}%`,
                        backgroundColor: item.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PDF & Google Sheets Report Modal */}
      <PdfReportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        reportType="analytics"
      />
    </div>
  );
}
