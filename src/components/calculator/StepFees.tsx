'use client';

import React from 'react';
import { Percent, Shield, Users, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface StepFeesProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepFees({ onNext, onBack }: StepFeesProps) {
  const { currentCalculator, updateCalculator, settings } = useStore();

  const price = Number(currentCalculator.sellingPrice) || 0;
  const commRate = Number(currentCalculator.tiktokCommissionPercent ?? settings.tiktokCommissionPercent);
  const transRate = Number(currentCalculator.transactionFeePercent ?? settings.transactionFeePercent);
  const affRate = Number(currentCalculator.affiliatePercent ?? settings.defaultAffiliatePercent);

  const commFee = (price * commRate) / 100;
  const transFee = (price * transRate) / 100;
  const affFee = (price * affRate) / 100;
  const totalFees = commFee + transFee + affFee;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">TikTok Shop & Platform Fees</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Configure platform commissions, merchant payment processing, and creator affiliate cuts.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TikTok Shop Commission */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              TikTok Commission (%)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="10.0"
              value={currentCalculator.tiktokCommissionPercent === undefined || currentCalculator.tiktokCommissionPercent === null ? '' : currentCalculator.tiktokCommissionPercent}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ tiktokCommissionPercent: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pr-8 pl-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Amount:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{settings.currencySymbol}{commFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Transaction / Processing Fees */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Transaction Fee (%)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="2.0"
              value={currentCalculator.transactionFeePercent === undefined || currentCalculator.transactionFeePercent === null ? '' : currentCalculator.transactionFeePercent}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ transactionFeePercent: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pr-8 pl-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Amount:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{settings.currencySymbol}{transFee.toFixed(2)}</span>
          </div>
        </div>

        {/* Creator Affiliate Commission */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              Affiliate Commission (%)
            </span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="5.0"
              value={currentCalculator.affiliatePercent === undefined || currentCalculator.affiliatePercent === null ? '' : currentCalculator.affiliatePercent}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ affiliatePercent: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pr-8 pl-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Amount:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{settings.currencySymbol}{affFee.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 flex items-start gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
        <Info className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Total TikTok Fees: {settings.currencySymbol}{totalFees.toFixed(2)} ({(commRate + transRate + affRate).toFixed(1)}% of Selling Price)</span>
          <p className="text-indigo-700/80 dark:text-indigo-300/80 text-[11px] mt-0.5">
            TikTok Shop standard US referral rate is typically 6% – 10% depending on category. Creator affiliates encourage viral creator promotions.
          </p>
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
          <span>Next Step (Marketing & Ads)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
