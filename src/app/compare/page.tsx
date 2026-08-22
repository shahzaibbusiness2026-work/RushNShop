'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  X, 
  Sparkles, 
  TrendingUp, 
  Trophy, 
  AlertTriangle, 
  Check, 
  ArrowRight, 
  ShoppingBag, 
  RotateCcw, 
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  Download
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { calculateProductProfit } from '@/lib/calculations';
import { exportToGoogleSheetsCSV, copyForGoogleSheets } from '@/lib/exportUtils';
import PdfReportModal from '@/components/export/PdfReportModal';
import { useRouter } from 'next/navigation';

export default function ComparePage() {
  const { 
    products, 
    comparisonProductIds, 
    setComparisonProductIds, 
    toggleCompareProduct,
    updateCalculator,
    settings,
    showToast
  } = useStore();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const router = useRouter();

  // Get products selected for comparison
  const comparedProducts = comparisonProductIds
    .map(id => products.find(p => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleRemove = (id: string) => {
    toggleCompareProduct(id);
  };

  const handleSelectProductForCompare = (id: string) => {
    toggleCompareProduct(id);
    setAddModalOpen(false);
  };

  const handleApplyAiSuggestion = () => {
    // Find LED lamp or first non-winner and increase price by $2
    const lamp = products.find(p => p.sku === 'LL-302' || p.name.includes('LED')) || products[1];
    if (lamp) {
      const newPrice = lamp.sellingPrice + 2.00;
      updateCalculator({ ...lamp, sellingPrice: newPrice });
      showToast('Suggestion Applied', `Increased ${lamp.name} price to ${formatCurrency(newPrice, settings.currencySymbol)} (Margin now 36.8%). Loaded into calculator.`, 'success');
      router.push('/calculator');
    }
  };

  const handleExportGoogleSheets = () => {
    const data = comparedProducts.map(p => {
      const calc = calculateProductProfit(p, settings);
      return {
        'Product Name': p.name,
        'SKU': p.sku,
        'Selling Price ($)': p.sellingPrice,
        'Product Cost ($)': p.costPrice,
        'Shipping & Packaging ($)': (p.shippingCost || 2) + (p.packagingCost || 1),
        'TikTok Fees ($)': calc.tiktokFeesTotal,
        'Ad Spend CAC ($)': calc.marketingTotal,
        'Total Cost ($)': calc.totalCostPerOrder,
        'Net Profit ($)': calc.netProfit,
        'Profit Margin (%)': `${calc.profitMarginPercent.toFixed(1)}%`,
        'Break-Even ($)': calc.breakEvenSellingPrice.toFixed(2),
        'Rating': p.bestFor || 'Good',
      };
    });
    exportToGoogleSheetsCSV(`RushNshop-Comparison-${Date.now()}`, data);
    showToast('Exported to Google Sheets', 'Comparison downloaded as Google Sheets CSV.', 'success');
  };

  const handleCopyGoogleSheets = () => {
    const data = comparedProducts.map(p => {
      const calc = calculateProductProfit(p, settings);
      return {
        'Product': p.name,
        'Price': `$${p.sellingPrice}`,
        'Cost': `$${calc.totalCostPerOrder}`,
        'Profit': `$${calc.netProfit}`,
        'Margin': `${calc.profitMarginPercent.toFixed(1)}%`,
        'Break-Even': `$${calc.breakEvenSellingPrice.toFixed(2)}`,
        'Best For': p.bestFor || 'Good',
      };
    });
    const success = copyForGoogleSheets(data);
    if (success) {
      showToast('Copied to Clipboard', 'Ready to paste (Ctrl+V) into Google Sheets.', 'success');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Compare Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Compare up to 4 products side by side to identify your top winners and margin bottlenecks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
            title="Copy for Google Sheets"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copy Google Sheets</span>
          </button>

          <button
            onClick={handleExportGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Google Sheets CSV</span>
          </button>

          <button
            onClick={() => setPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>

          <button
            onClick={() => setAddModalOpen(true)}
            disabled={comparedProducts.length >= 4}
            className="flex items-center gap-2 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* Comparison Grid Matrix */}
      {comparedProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Products in Comparison</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Select up to 4 products from your history or calculator to compare unit economics side by side.
          </p>
          <button
            onClick={() => setAddModalOpen(true)}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Select Products to Compare
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              {/* Product Header Cards Row */}
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <th className="py-5 px-6 font-bold text-slate-400 dark:text-slate-400 uppercase text-[11px] w-48">
                    Metric Breakdown
                  </th>
                  {comparedProducts.map((prod) => (
                    <th key={prod.id} className="py-5 px-6 text-center align-top relative">
                      <button
                        onClick={() => handleRemove(prod.id)}
                        className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-xs overflow-hidden mb-2">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">{prod.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{prod.sku}</span>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty columns up to 4 */}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="py-5 px-6 text-center align-middle">
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center p-3 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                      >
                        <Plus className="w-5 h-5 mb-1" />
                        <span className="text-[11px] font-semibold">Add Product</span>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Data Rows */}
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {/* Selling Price */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">Selling Price</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="py-3.5 px-6 text-center font-black text-slate-900 dark:text-white">
                      {formatCurrency(p.sellingPrice, settings.currencySymbol)}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-sp-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Product Unit Cost */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-medium text-slate-600 dark:text-slate-400">Product Cost (Supplier)</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="py-3.5 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency(p.costPrice, settings.currencySymbol)}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-cp-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Shipping & Packaging */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-medium text-slate-600 dark:text-slate-400">Shipping & Packaging</td>
                  {comparedProducts.map((p) => (
                    <td key={p.id} className="py-3.5 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                      {formatCurrency((p.shippingCost || 2) + (p.packagingCost || 1), settings.currencySymbol)}
                    </td>
                  ))}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-spk-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* TikTok Fees */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-medium text-slate-600 dark:text-slate-400">TikTok Fees & Commission</td>
                  {comparedProducts.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    return (
                      <td key={p.id} className="py-3.5 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(calc.tiktokFeesTotal, settings.currencySymbol)} ({calc.tiktokFeesPercentTotal}%)
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-tf-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Ads & Marketing CAC */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-medium text-slate-600 dark:text-slate-400">TikTok Ads & Creator CPA</td>
                  {comparedProducts.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    return (
                      <td key={p.id} className="py-3.5 px-6 text-center font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(calc.marketingTotal, settings.currencySymbol)}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-ad-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Total Cost */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/30 dark:bg-slate-850/50">
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">Total Cost per Order</td>
                  {comparedProducts.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    return (
                      <td key={p.id} className="py-3.5 px-6 text-center font-black text-slate-900 dark:text-white">
                        {formatCurrency(calc.totalCostPerOrder, settings.currencySymbol)}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-tc-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Net Profit */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">Net Profit per Unit</td>
                  {comparedProducts.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    return (
                      <td key={p.id} className="py-3.5 px-6 text-center font-extrabold">
                        <span className={calc.netProfit < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400 text-sm'}>
                          {formatCurrency(calc.netProfit, settings.currencySymbol)}
                        </span>
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-np-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Profit Margin */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">Profit Margin (%)</td>
                  {comparedProducts.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    return (
                      <td key={p.id} className="py-3.5 px-6 text-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-black inline-block",
                          calc.profitHealthStatus === 'excellent' && "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40",
                          calc.profitHealthStatus === 'good' && "bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200/40 dark:border-teal-800/40",
                          calc.profitHealthStatus === 'low' && "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200/40 dark:border-amber-800/40",
                          calc.profitHealthStatus === 'loss' && "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/40 dark:border-rose-800/40"
                        )}>
                          {formatPercent(calc.profitMarginPercent)}
                        </span>
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-pm-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Break-Even Price */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-medium text-slate-600 dark:text-slate-400">Break-Even Selling Price</td>
                  {comparedProducts.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    return (
                      <td key={p.id} className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-400 font-semibold">
                        {formatCurrency(calc.breakEvenSellingPrice, settings.currencySymbol)}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-be-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>

                {/* Best For Tag */}
                <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 bg-slate-50/40 dark:bg-slate-850/50">
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">Best For / Rating</td>
                  {comparedProducts.map((p) => {
                    const calc = calculateProductProfit(p, settings);
                    const isWinner = p.sku === 'WC-001' || calc.profitMarginPercent >= 40;
                    const isLow = calc.profitHealthStatus === 'low' || calc.profitHealthStatus === 'loss';

                    return (
                      <td key={p.id} className="py-4 px-6 text-center">
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-extrabold inline-flex items-center gap-1 shadow-2xs",
                          isWinner && "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
                          !isWinner && !isLow && "bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800",
                          isLow && "bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                        )}>
                          {isWinner ? 'Overall Winner 🏆' : isLow ? 'Needs Work' : 'Good Performer'}
                        </span>
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - comparedProducts.length }).map((_, i) => (
                    <td key={`emp-tag-${i}`} className="text-center text-slate-300 dark:text-slate-600">-</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Recommendation Box (Design Choice 4 Bottom) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/60 dark:from-slate-800 dark:to-slate-850 border border-indigo-100/90 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              AI Profit Recommendation
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
              <strong>Wireless Charger</strong> is your best performer with 43.3% net margin. Consider increasing the price of <strong>LED Lamp</strong> by <strong>$2.00</strong> to improve its margin to <strong>36.8%</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleApplyAiSuggestion}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Suggestion</span>
          </button>
        </div>
      </div>

      {/* Add Product Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Select Product to Compare</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {products.map((prod) => {
                const isSelected = comparisonProductIds.includes(prod.id);
                return (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectProductForCompare(prod.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors",
                      isSelected
                        ? "bg-brand-50 dark:bg-brand-950/80 border-brand-200 dark:border-brand-800 text-brand-900 dark:text-brand-300"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">{prod.name}</p>
                        <p className="text-[10px] text-slate-400">{prod.sku} • {formatCurrency(prod.sellingPrice, settings.currencySymbol)}</p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Selected
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">+ Add</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PDF & Google Sheets Report Modal */}
      <PdfReportModal
        isOpen={pdfModalOpen}
        onClose={() => setPdfModalOpen(false)}
        reportType="comparison"
      />
    </div>
  );
}
