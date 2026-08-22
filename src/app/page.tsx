'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Download, 
  ChevronDown, 
  Sparkles, 
  ArrowRight, 
  FileSpreadsheet,
  FileText,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import KpiCards from '@/components/dashboard/KpiCards';
import ProfitOverviewChart from '@/components/dashboard/ProfitOverviewChart';
import TopPerformingProducts from '@/components/dashboard/TopPerformingProducts';
import ProfitHealthCard from '@/components/dashboard/ProfitHealthCard';
import PdfReportModal from '@/components/export/PdfReportModal';
import { useStore } from '@/context/StoreContext';
import { exportToCSV } from '@/lib/utils';
import { exportToGoogleSheetsCSV } from '@/lib/exportUtils';
import { calculateProductProfit } from '@/lib/calculations';

export default function DashboardPage() {
  const { products, dateRange, setDateRange, setAiDrawerOpen, showToast, settings } = useStore();
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  const dateOptions = [
    'Today (24h)',
    'Last 7 Days (Week)',
    'Last 30 Days (Month)',
    'This Quarter (3 Months)',
    'Last 12 Months (Year)',
    'All Time (Years)',
  ];

  const handleExportGoogleSheets = () => {
    const reportData = products.map(p => {
      const calc = calculateProductProfit(p, settings);
      return {
        'Product Name': p.name,
        'SKU': p.sku,
        'Category': p.category,
        'Selling Price ($)': p.sellingPrice,
        'Supplier Cost ($)': p.costPrice,
        'Shipping ($)': p.shippingCost,
        'Packaging ($)': p.packagingCost,
        'TikTok Fees ($)': calc.tiktokFeesTotal,
        'Ad Spend CPA ($)': calc.marketingTotal,
        'Total Cost ($)': calc.totalCostPerOrder,
        'Net Profit ($)': calc.netProfit,
        'Profit Margin (%)': `${calc.profitMarginPercent.toFixed(1)}%`,
        'Break-Even ($)': calc.breakEvenSellingPrice.toFixed(2),
        'Max Ad CPA ($)': calc.maxAffordableAdCost.toFixed(2),
        'Status': calc.profitHealthStatus,
      };
    });
    exportToGoogleSheetsCSV(`RushNshop-Portfolio-Report-${Date.now()}`, reportData);
    showToast('Exported to Google Sheets', 'Downloaded Google Sheets formatted CSV.', 'success');
  };

  const handleExportReport = () => {
    // Generate clean CSV report for current portfolio
    const reportData = products.map(p => {
      const fees = (p.sellingPrice * (p.tiktokCommissionPercent + p.transactionFeePercent + p.affiliatePercent)) / 100;
      const totalCost = p.costPrice + p.shippingCost + p.packagingCost + p.otherProductCost + fees + p.tiktokAdsCost + p.creatorCost + p.otherMarketingCost + p.customExpenses;
      const netProfit = p.sellingPrice - totalCost;
      const margin = p.sellingPrice > 0 ? ((netProfit / p.sellingPrice) * 100).toFixed(1) : '0';
      return {
        ProductName: p.name,
        SKU: p.sku,
        Category: p.category,
        SellingPrice: p.sellingPrice.toFixed(2),
        ProductCost: p.costPrice.toFixed(2),
        ShippingCost: p.shippingCost.toFixed(2),
        PackagingCost: p.packagingCost.toFixed(2),
        TikTokFees: fees.toFixed(2),
        AdSpendCPA: p.tiktokAdsCost.toFixed(2),
        TotalCostPerOrder: totalCost.toFixed(2),
        NetProfitPerUnit: netProfit.toFixed(2),
        ProfitMargin: `${margin}%`,
        Status: p.status || 'good',
      };
    });

    exportToCSV(`RushNshop-Profit-Report-${Date.now()}`, reportData);
    showToast('Report Exported', 'Downloaded complete TikTok Shop Profit Margin CSV report.', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              TikTok Sync Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Unit economics intelligence and live profitability tracking for {settings.storeName}.
          </p>
        </div>

        {/* Date Filter & Export Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Calculator Shortcut */}
          <Link
            href="/calculator"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Calculate Product</span>
          </Link>

          {/* Date Picker Button */}
          <div className="relative">
            <button
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{dateRange}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl p-1 z-30 animate-in fade-in zoom-in-95">
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      setDateDropdownOpen(false);
                      showToast('Date Range Updated', `Filtered dashboard by: ${opt}`, 'info');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg font-medium transition-colors ${
                      dateRange === opt
                        ? 'bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report CTA */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setPdfModalOpen(true);
                    setExportDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-slate-800 hover:text-brand-700 dark:hover:text-brand-400 rounded-xl font-medium transition-colors text-left"
                >
                  <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Executive PDF Report</span>
                </button>

                <button
                  onClick={() => {
                    handleExportGoogleSheets();
                    setExportDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-xl font-medium transition-colors text-left"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Export Google Sheets CSV</span>
                </button>

                <button
                  onClick={() => {
                    handleExportReport();
                    setExportDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors text-left"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  <span>Export Raw CSV</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <KpiCards />

      {/* Main Grid: Profit Overview (2-cols for wide panoramic breathing room) + Profit Health (1-col) + Top Products (Full Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profit Overview Area Chart */}
        <div className="lg:col-span-2">
          <ProfitOverviewChart />
        </div>

        {/* Right: Profit Health Donut Gauge */}
        <div className="lg:col-span-1">
          <ProfitHealthCard />
        </div>

        {/* Bottom Tier: Top Performing Products Leaderboard */}
        <div className="lg:col-span-3">
          <TopPerformingProducts />
        </div>
      </div>

      {/* Quick Action / AI Recommendation Bar - Polished Product Utility Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 dark:bg-slate-850 text-white border border-slate-800 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
              Ready to evaluate a new TikTok product?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-normal">
              Calculate exact shipping, TikTok Shop 10% commission, affiliate cuts, and break-even ad CPA before launching.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <Link
            href="/calculator"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Open Profit Calculator</span>
          </Link>
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700 transition-all"
          >
            <span>Ask AI Advisor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Executive PDF Report Modal */}
      <PdfReportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        reportType="portfolio"
      />
    </div>
  );
}
