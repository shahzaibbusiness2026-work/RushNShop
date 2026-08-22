'use client';

import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck,
  Calendar,
  Share2,
  Copy,
  BarChart3,
  PieChart as PieIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { copyForGoogleSheets, exportToGoogleSheetsCSV } from '@/lib/exportUtils';
import { calculateProductProfit } from '@/lib/calculations';

interface PdfReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType?: 'analytics' | 'calculator' | 'comparison' | 'portfolio';
}

export default function PdfReportModal({
  isOpen,
  onClose,
  reportType = 'analytics',
}: PdfReportModalProps) {
  const { products, settings, currentCalculator, currentCalculation, comparisonProductIds, activeStore, showToast } = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  // Product comparison bar chart data
  const productComparisonChartData = products.slice(0, 6).map((p) => {
    const calc = calculateProductProfit(p, settings);
    return {
      name: p.name.length > 14 ? p.name.slice(0, 12) + '...' : p.name,
      fullName: p.name,
      price: Number(p.sellingPrice.toFixed(2)),
      cost: Number(calc.totalCostPerOrder.toFixed(2)),
      profit: Number(calc.netProfit.toFixed(2)),
      margin: Number(calc.profitMarginPercent.toFixed(1)),
    };
  });

  // Health distribution donut chart data
  const healthData = [
    { name: 'Excellent (40%+)', value: 55, color: '#10B981' },
    { name: 'Good (25-40%)', value: 30, color: '#06B6D4' },
    { name: 'Needs Work (<25%)', value: 15, color: '#F59E0B' },
  ];

  const handleCopyGoogleSheets = () => {
    let data: Record<string, any>[] = [];
    if (reportType === 'analytics' || reportType === 'portfolio') {
      data = products.map(p => {
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
          'Marketing CAC ($)': calc.marketingTotal,
          'Total Cost ($)': calc.totalCostPerOrder,
          'Net Profit ($)': calc.netProfit,
          'Profit Margin (%)': calc.profitMarginPercent.toFixed(1),
          'Break-Even ($)': calc.breakEvenSellingPrice.toFixed(2),
          'Max Ad CPA ($)': calc.maxAffordableAdCost.toFixed(2),
          'Status': calc.profitHealthStatus,
        };
      });
    } else if (reportType === 'calculator') {
      data = [{
        'Product Name': currentCalculator.name || 'Current Product',
        'SKU': currentCalculator.sku || 'N/A',
        'Category': currentCalculator.category || 'General',
        'Selling Price ($)': currentCalculator.sellingPrice,
        'Supplier Cost ($)': currentCalculator.costPrice,
        'Shipping ($)': currentCalculator.shippingCost,
        'Packaging ($)': currentCalculator.packagingCost,
        'TikTok Commission (%)': currentCalculator.tiktokCommissionPercent,
        'Transaction Fee (%)': currentCalculator.transactionFeePercent,
        'Affiliate (%)': currentCalculator.affiliatePercent,
        'TikTok Fees Total ($)': currentCalculation.tiktokFeesTotal,
        'Ads CAC ($)': currentCalculation.marketingTotal,
        'Total Order Cost ($)': currentCalculation.totalCostPerOrder,
        'Net Profit ($)': currentCalculation.netProfit,
        'Profit Margin (%)': currentCalculation.profitMarginPercent.toFixed(1),
        'Break-Even Price ($)': currentCalculation.breakEvenSellingPrice.toFixed(2),
        'Max Affordable CPA ($)': currentCalculation.maxAffordableAdCost.toFixed(2),
        'Target Recommended Price ($)': currentCalculation.recommendedSellingPrice.toFixed(2),
        'Profit Health Status': currentCalculation.profitHealthStatus,
      }];
    }

    const success = copyForGoogleSheets(data);
    if (success) {
      showToast('Copied for Google Sheets', 'Tab-separated data copied! Paste (Ctrl+V) directly into Google Sheets.', 'success');
    } else {
      exportToGoogleSheetsCSV(`RushNshop-${reportType}-Report`, data);
      showToast('Google Sheets CSV Downloaded', 'Import directly into Google Sheets via File > Import.', 'info');
    }
  };

  const handleDownloadGoogleSheetsCSV = () => {
    let data: Record<string, any>[] = [];
    if (reportType === 'analytics' || reportType === 'portfolio') {
      data = products.map(p => {
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
          'Marketing CAC ($)': calc.marketingTotal,
          'Total Cost ($)': calc.totalCostPerOrder,
          'Net Profit ($)': calc.netProfit,
          'Profit Margin (%)': `${calc.profitMarginPercent.toFixed(1)}%`,
          'Break-Even ($)': calc.breakEvenSellingPrice.toFixed(2),
          'Max Ad CPA ($)': calc.maxAffordableAdCost.toFixed(2),
          'Status': calc.profitHealthStatus,
        };
      });
    } else {
      data = [{
        'Product': currentCalculator.name,
        'SKU': currentCalculator.sku,
        'Selling Price': currentCalculator.sellingPrice,
        'Total Cost': currentCalculation.totalCostPerOrder,
        'Net Profit': currentCalculation.netProfit,
        'Profit Margin': `${currentCalculation.profitMarginPercent.toFixed(1)}%`,
        'Break Even': currentCalculation.breakEvenSellingPrice.toFixed(2),
        'Max Ad CPA': currentCalculation.maxAffordableAdCost.toFixed(2),
      }];
    }
    exportToGoogleSheetsCSV(`RushNshop-${reportType}-Report`, data);
    showToast('Exported for Google Sheets', 'Formatted CSV downloaded with UTF-8 encoding.', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Print CSS Injection for Exact Color and Chart Retention */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-pdf-document, #printable-pdf-document * {
            visibility: visible;
          }
          #printable-pdf-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px !important;
            background: white !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Action Header (Hidden in Print) */}
        <div className="no-print p-4 sm:p-5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Executive PDF & Google Sheets Report</h3>
              <p className="text-[11px] text-slate-400">High-resolution printable charts, graphs & financial matrix</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyGoogleSheets}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              title="Copy formatted data to paste into Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Copy for Google Sheets</span>
            </button>

            <button
              onClick={handleDownloadGoogleSheetsCSV}
              className="hidden sm:flex px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Google Sheets CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save / Print PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/20 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document with Graphs & Charts */}
        <div 
          id="printable-pdf-document"
          ref={printRef} 
          className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-white text-slate-900 print:p-0"
        >
          
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b pb-6 border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
                  R
                </div>
                <span className="text-xl font-extrabold tracking-tight text-slate-900">RushN<span className="text-brand-600">shop</span></span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">TikTok Shop Unit Economics, Profit Graphs & Performance Audit</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Store: <strong className="text-slate-700">{activeStore}</strong> • Merchant: <strong>Alex Johnson</strong></p>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase border border-emerald-200">
                Official Audit Report
              </span>
              <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
              1. Executive Summary KPIs
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Products Analyzed</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{products.length}</p>
                <span className="text-[10px] font-bold text-emerald-600">↑ 18.6% vs last month</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Average Profit Margin</span>
                <p className="text-xl font-black text-emerald-600 mt-0.5">34.2%</p>
                <span className="text-[10px] font-bold text-emerald-600">Target: {settings.targetProfitMarginPercent}%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Total Net Profit</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{formatCurrency(12540, settings.currencySymbol)}</p>
                <span className="text-[10px] font-bold text-emerald-600">↑ 22.1% growth</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Portfolio Health</span>
                <p className="text-xl font-black text-emerald-600 mt-0.5">82% Healthy</p>
                <span className="text-[10px] font-bold text-slate-600">55% High Margin</span>
              </div>
            </div>
          </div>

          {/* Embedded Visual Graphs & Charts Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-brand-600" />
              2. Product Economics & Margin Comparison Charts
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product Profitability Bar Chart (2 Cols) */}
              <div className="md:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Unit Selling Price vs Realized Net Profit</span>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-slate-600">
                      <span className="w-2 h-2 rounded bg-indigo-500" /> Retail Price
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                      <span className="w-2 h-2 rounded bg-emerald-500" /> Net Profit
                    </span>
                  </div>
                </div>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productComparisonChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(value: any, name: any) => [
                          `$${Number(value).toFixed(2)}`,
                          name === 'price' ? 'Retail Price' : 'Net Profit'
                        ]}
                      />
                      <Bar dataKey="price" fill="#6366F1" radius={[4, 4, 0, 0]} name="price" />
                      <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Margin Health Donut Distribution (1 Col) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Margin Health Distribution</span>
                  <p className="text-[10px] text-slate-400">Target threshold compliance</p>
                </div>

                <div className="h-40 w-full relative flex items-center justify-center my-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={healthData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={56}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {healthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-black text-slate-900">82%</span>
                    <span className="text-[8px] text-slate-400 font-semibold uppercase">Healthy</span>
                  </div>
                </div>

                <div className="space-y-1 text-[10px]">
                  {healthData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        {d.name}
                      </span>
                      <strong className="text-slate-900">{d.value}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Unit Economics Waterfall Breakdown Graph */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-600" />
              3. Unit Economics Waterfall Breakdown ($100 Scale)
            </h4>
            
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span>Gross TikTok Customer Revenue</span>
                  <span className="text-slate-900">$100.00 (100%)</span>
                </div>
                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-brand-600 h-full w-full" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Supplier Manufacturing & Sourcing Costs</span>
                  <span className="text-slate-600">-$32.00 (32.0%)</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full w-[32%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Domestic Shipping & Poly Packaging</span>
                  <span className="text-slate-600">-$10.00 (10.0%)</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full w-[10%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>TikTok Shop Commission (10%) + Payment Processing (2%)</span>
                  <span className="text-amber-600">-$12.00 (12.0%)</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full w-[12%]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>TikTok Spark Ads Target CPA & Creator Commission</span>
                  <span className="text-rose-600">-$12.00 (12.0%)</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full w-[12%]" />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <div className="flex justify-between text-xs font-extrabold">
                  <span className="text-emerald-700">Net Realized Profit Margin</span>
                  <span className="text-emerald-700">+$34.00 (34.0% Net Margin)</span>
                </div>
                <div className="h-3.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[34%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Unit Economics Catalog Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              4. Saved Product Profit Matrix
            </h4>
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-2.5 px-3">Product / SKU</th>
                    <th className="py-2.5 px-3">Selling Price</th>
                    <th className="py-2.5 px-3">Product Cost</th>
                    <th className="py-2.5 px-3">TikTok Fees</th>
                    <th className="py-2.5 px-3">Ads CAC</th>
                    <th className="py-2.5 px-3">Net Profit</th>
                    <th className="py-2.5 px-3">Margin %</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {p.name}
                          <span className="block text-[10px] text-slate-400 font-normal">{p.sku}</span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{formatCurrency(p.sellingPrice, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatCurrency(calc.productCostTotal, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatCurrency(calc.tiktokFeesTotal, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{formatCurrency(calc.marketingTotal, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-3 font-black text-emerald-600">{formatCurrency(calc.netProfit, settings.currencySymbol)}</td>
                        <td className="py-2.5 px-3 font-bold">{formatPercent(calc.profitMarginPercent)}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                            calc.profitHealthStatus === 'excellent' ? 'bg-emerald-50 text-emerald-700' :
                            calc.profitHealthStatus === 'good' ? 'bg-teal-50 text-teal-700' :
                            calc.profitHealthStatus === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {calc.profitHealthStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Advisor Recommendations */}
          <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-xs text-brand-950">AI Pricing & Margin Recommendations</h5>
              <p className="text-xs text-brand-800/90 mt-1 leading-relaxed">
                • <strong>Wireless Charger (WC-001)</strong> is currently your top performer with 43.3% net margin. Allocate 60% of paid TikTok Spark ad budget to this SKU.<br/>
                • <strong>LED Lamp (LL-302)</strong> can achieve target 36%+ margin by increasing retail price by $2.00 from $24.99 to $26.99.<br/>
                • Maintain TikTok Spark Ad CPA ceiling below <strong>$7.99</strong> across all campaigns to ensure minimum $5.00 profit per sale.
              </p>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Certified Accurate Unit Economics • RushNshop Engine</span>
            </div>
            <span>Generated for TikTok Shop Seller Dashboard</span>
          </div>

        </div>

      </div>
    </div>
  );
}
