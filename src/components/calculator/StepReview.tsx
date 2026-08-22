'use client';

import React from 'react';
import { 
  CheckCircle2, 
  Sliders, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  ArrowLeft, 
  DollarSign, 
  Layers, 
  Flame 
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent } from '@/lib/utils';

interface StepReviewProps {
  onBack: () => void;
  onSave: () => void;
}

export default function StepReview({ onBack, onSave }: StepReviewProps) {
  const { currentCalculator, currentCalculation, updateCalculator, settings } = useStore();

  const price = Number(currentCalculator.sellingPrice) || 29.99;

  // Breakdown percentages for the visual bar
  const total = price > 0 ? price : 1;
  const productCostPct = Math.min(100, (currentCalculation.productCostTotal / total) * 100);
  const tiktokFeesPct = Math.min(100 - productCostPct, (currentCalculation.tiktokFeesTotal / total) * 100);
  const marketingPct = Math.min(100 - (productCostPct + tiktokFeesPct), (currentCalculation.marketingTotal / total) * 100);
  const profitPct = Math.max(0, 100 - (productCostPct + tiktokFeesPct + marketingPct));

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review & Profit Simulation</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Test price variations and analyze cost distribution curves in real-time.</p>
      </div>

      {/* Interactive Price Slider */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-850 border border-brand-100 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white">Live Price Simulation Slider</span>
          </div>
          <span className="text-base font-black text-brand-700 dark:text-brand-400">
            {formatCurrency(price, settings.currencySymbol)}
          </span>
        </div>

        <input
          type="range"
          min="5"
          max="150"
          step="0.50"
          value={price}
          onChange={(e) => updateCalculator({ sellingPrice: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />

        <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          <span>{settings.currencySymbol}5.00 (Low Ticket)</span>
          <span className="text-brand-600 dark:text-brand-400 font-bold">Recommended: {formatCurrency(currentCalculation.recommendedSellingPrice, settings.currencySymbol)}</span>
          <span>{settings.currencySymbol}150.00 (High Ticket)</span>
        </div>
      </div>

      {/* Visual Cost & Margin Distribution Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <span>Revenue Breakdown per Unit</span>
          <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(currentCalculation.netProfit, settings.currencySymbol)} Profit ({formatPercent(currentCalculation.profitMarginPercent)})</span>
        </div>

        {/* Stacked multi-color bar */}
        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden shadow-inner">
          <div 
            style={{ width: `${productCostPct}%` }} 
            className="bg-indigo-400 transition-all duration-300" 
            title={`Product Cost: ${formatCurrency(currentCalculation.productCostTotal)} (${productCostPct.toFixed(1)}%)`}
          />
          <div 
            style={{ width: `${tiktokFeesPct}%` }} 
            className="bg-amber-400 transition-all duration-300" 
            title={`TikTok Fees: ${formatCurrency(currentCalculation.tiktokFeesTotal)} (${tiktokFeesPct.toFixed(1)}%)`}
          />
          <div 
            style={{ width: `${marketingPct}%` }} 
            className="bg-rose-400 transition-all duration-300" 
            title={`Marketing & Ads: ${formatCurrency(currentCalculation.marketingTotal)} (${marketingPct.toFixed(1)}%)`}
          />
          <div 
            style={{ width: `${profitPct}%` }} 
            className="bg-emerald-500 transition-all duration-300" 
            title={`Net Profit: ${formatCurrency(currentCalculation.netProfit)} (${profitPct.toFixed(1)}%)`}
          />
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">Product: {formatCurrency(currentCalculation.productCostTotal)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">TikTok Fees: {formatCurrency(currentCalculation.tiktokFeesTotal)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
            <span className="text-slate-600 dark:text-slate-400">Ads/CAC: {formatCurrency(currentCalculation.marketingTotal)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-emerald-700 dark:text-emerald-400">Net Profit: {formatCurrency(currentCalculation.netProfit)}</span>
          </div>
        </div>
      </div>

      {/* Advanced Economic Formulas Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Break-Even Selling Price</p>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
            {formatCurrency(currentCalculation.breakEvenSellingPrice, settings.currencySymbol)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Minimum price before losing money</p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Max Affordable Ad CPA</p>
          <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400 mt-0.5">
            {formatCurrency(currentCalculation.maxAffordableAdCost, settings.currencySymbol)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Maintains ${settings.minimumAcceptableProfit} minimum profit</p>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Target Recommended Price</p>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(currentCalculation.recommendedSellingPrice, settings.currencySymbol)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Achieves {settings.targetProfitMarginPercent}% target margin</p>
        </div>
      </div>

      {/* AI Simulation Insight Banner */}
      <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-3">
        <div className="w-7 h-7 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">AI Profit Intelligence Insight</h4>
          <p className="mt-0.5 text-slate-600 dark:text-slate-300 leading-relaxed">{currentCalculation.aiRecommendation}</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSave}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Calculation</span>
        </button>
      </div>
    </div>
  );
}
