'use client';

import React from 'react';
import { Megaphone, Video, Sparkles, PlusCircle, ArrowLeft, ArrowRight, DollarSign } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface StepMarketingProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepMarketing({ onNext, onBack }: StepMarketingProps) {
  const { currentCalculator, updateCalculator, settings } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Marketing & Acquisition Costs</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Budget for TikTok Spark Ads, influencer sample seedings, and order buffers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TikTok Ads Cost per Order (CPA) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              TikTok Ads Cost per Order (CPA)
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="3.50"
              value={currentCalculator.tiktokAdsCost === undefined || currentCalculator.tiktokAdsCost === null ? '' : currentCalculator.tiktokAdsCost}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ tiktokAdsCost: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Expected paid ad cost to acquire 1 customer sale</span>
        </div>

        {/* Creator / Influencer Cost */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Creator / Influencer Cost
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.00"
              value={currentCalculator.creatorCost === undefined || currentCalculator.creatorCost === null ? '' : currentCalculator.creatorCost}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ creatorCost: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Sample seeding, retainer, or spark authorization fees</span>
        </div>

        {/* Other Marketing Expenses */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Other Marketing Expenses
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.00"
              value={currentCalculator.otherMarketingCost === undefined || currentCalculator.otherMarketingCost === null ? '' : currentCalculator.otherMarketingCost}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ otherMarketingCost: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Creative video editing, UGC assets</span>
        </div>

        {/* Custom Expenses Buffer */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <PlusCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Custom Buffer / Return Risk
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="0.00"
              value={currentCalculator.customExpenses === undefined || currentCalculator.customExpenses === null ? '' : currentCalculator.customExpenses}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ customExpenses: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Estimated return reserve or damage contingency</span>
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
          onClick={onNext}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2 group"
        >
          <span>Review & Simulation</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
