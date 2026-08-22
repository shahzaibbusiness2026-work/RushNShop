'use client';

import React from 'react';
import { DollarSign, Percent, TrendingUp, AlertCircle, ArrowUpRight, Scale } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function ProfitSummaryCard() {
  const { currentCalculation, settings } = useStore();

  const isProfitable = currentCalculation.netProfit > 0;
  const isLoss = currentCalculation.profitHealthStatus === 'loss';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card space-y-5">
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-base text-slate-900 dark:text-white">Profit Summary (Estimated)</h4>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Live per Unit</span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Selling Price</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(currentCalculation.revenue, settings.currencySymbol)}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Cost</span>
          <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(currentCalculation.totalCostPerOrder, settings.currencySymbol)}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Profit</span>
          <p className={`text-2xl font-black mt-0.5 ${
            isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {formatCurrency(currentCalculation.netProfit, settings.currencySymbol)}
          </p>
        </div>

        <div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Profit Margin</span>
          <p className={`text-2xl font-black mt-0.5 ${
            isLoss ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {formatPercent(currentCalculation.profitMarginPercent)}
          </p>
        </div>
      </div>

      {/* Detailed Breakdown List */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Product Cost:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {formatCurrency(currentCalculation.productCostTotal, settings.currencySymbol)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>TikTok Fees ({currentCalculation.tiktokFeesPercentTotal}%):</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {formatCurrency(currentCalculation.tiktokFeesTotal, settings.currencySymbol)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Marketing & Ads CPA:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {formatCurrency(currentCalculation.marketingTotal, settings.currencySymbol)}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <span>Cost Ratio:</span>
          <span className="font-bold text-slate-800 dark:text-slate-100">
            {formatPercent(currentCalculation.costPercent)}
          </span>
        </div>
      </div>
    </div>
  );
}
