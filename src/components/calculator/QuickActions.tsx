'use client';

import React from 'react';
import { 
  Bookmark, 
  Tag, 
  Copy, 
  Columns, 
  Download, 
  Printer, 
  RotateCcw,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { copyForGoogleSheets, exportToGoogleSheetsCSV } from '@/lib/exportUtils';

interface QuickActionsProps {
  onSave: () => void;
  onCreateListing: () => void;
  onDuplicate: () => void;
  onAddToComparison: () => void;
  onOpenPdfReport: () => void;
}

export default function QuickActions({
  onSave,
  onCreateListing,
  onDuplicate,
  onAddToComparison,
  onOpenPdfReport,
}: QuickActionsProps) {
  const { currentCalculator, currentCalculation, settings, showToast } = useStore();

  const handleCopyGoogleSheets = () => {
    const row = [{
      'Product Name': currentCalculator.name || 'Current Product',
      'SKU': currentCalculator.sku || 'N/A',
      'Category': currentCalculator.category || 'General',
      'Selling Price ($)': currentCalculator.sellingPrice,
      'Product Cost ($)': currentCalculator.costPrice,
      'Shipping ($)': currentCalculator.shippingCost,
      'Packaging ($)': currentCalculator.packagingCost,
      'TikTok Commission (%)': currentCalculator.tiktokCommissionPercent,
      'Transaction Fee (%)': currentCalculator.transactionFeePercent,
      'Affiliate (%)': currentCalculator.affiliatePercent,
      'TikTok Fees ($)': currentCalculation.tiktokFeesTotal,
      'Marketing CAC ($)': currentCalculation.marketingTotal,
      'Total Cost ($)': currentCalculation.totalCostPerOrder,
      'Net Profit ($)': currentCalculation.netProfit,
      'Profit Margin (%)': `${currentCalculation.profitMarginPercent.toFixed(1)}%`,
      'Break-Even ($)': currentCalculation.breakEvenSellingPrice.toFixed(2),
      'Max Ad CPA ($)': currentCalculation.maxAffordableAdCost.toFixed(2),
      'Target Price ($)': currentCalculation.recommendedSellingPrice.toFixed(2),
      'Health Status': currentCalculation.profitHealthStatus,
    }];
    const success = copyForGoogleSheets(row);
    if (success) {
      showToast('Copied for Google Sheets', 'Tab-separated calculation copied. Paste (Ctrl+V) into Google Sheets.', 'success');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card space-y-3">
      <h4 className="font-bold text-base text-slate-900 dark:text-white mb-2">Quick Actions</h4>

      {/* Save Calculation */}
      <button
        onClick={onSave}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
          <Bookmark className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Save Calculation</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Save this calculation to history</p>
        </div>
      </button>

      {/* Create Listing */}
      <button
        onClick={onCreateListing}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Tag className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Create Listing</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Create TikTok Shop listing draft</p>
        </div>
      </button>

      {/* Google Sheets Export */}
      <button
        onClick={handleCopyGoogleSheets}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
          <FileSpreadsheet className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Copy for Google Sheets</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">1-Click copy formatted matrix (Ctrl+V)</p>
        </div>
      </button>

      {/* Duplicate */}
      <button
        onClick={onDuplicate}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 group-hover:bg-slate-800 group-hover:text-white dark:group-hover:bg-slate-700 transition-colors">
          <Copy className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Duplicate</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Clone inputs for a new variant</p>
        </div>
      </button>

      {/* Add to Comparison */}
      <button
        onClick={onAddToComparison}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <Columns className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Add to Comparison</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Compare with up to 4 other items</p>
        </div>
      </button>

      {/* PDF Report */}
      <button
        onClick={onOpenPdfReport}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-left transition-colors group"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-brand-600 text-white flex items-center justify-center shrink-0">
          <Printer className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Executive PDF Report</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">High-res charts & print layout</p>
        </div>
      </button>
    </div>
  );
}
