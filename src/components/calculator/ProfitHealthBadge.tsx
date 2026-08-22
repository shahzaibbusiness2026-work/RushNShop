'use client';

import React from 'react';
import { CheckCircle2, XCircle, Sparkles, AlertTriangle, AlertOctagon, TrendingUp } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

export default function ProfitHealthBadge() {
  const { currentCalculation } = useStore();

  const statusConfig = {
    excellent: {
      badgeText: 'Excellent Profit',
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: TrendingUp,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      message: 'Your product is in a great range! Keep it up.',
    },
    good: {
      badgeText: 'Good Profit',
      badgeClass: 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      icon: CheckCircle2,
      iconColor: 'text-teal-600 dark:text-teal-400',
      message: 'Healthy margin profile. Ready for TikTok ads.',
    },
    low: {
      badgeText: 'Low Profit Warning',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
      message: 'Margin is below target. Consider increasing price or reducing ad CPA.',
    },
    loss: {
      badgeText: 'Loss Warning',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: AlertOctagon,
      iconColor: 'text-rose-600 dark:text-rose-400',
      message: 'Critical: Product is currently operating at a net loss.',
    },
  };

  const current = statusConfig[currentCalculation.profitHealthStatus] || statusConfig.good;
  const StatusIcon = current.icon;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-base text-slate-900 dark:text-white">Profit Health</h4>
        <span className="p-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
        </span>
      </div>

      {/* Main Status Pill */}
      <div>
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border shadow-2xs",
          current.badgeClass
        )}>
          <StatusIcon className="w-4 h-4" />
          <span>{current.badgeText}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
          {current.message}
        </p>
      </div>

      {/* Dynamic Checks List */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        {currentCalculation.checks.map((chk, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs">
            {chk.passed ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className={cn(
                "font-semibold",
                chk.passed ? "text-slate-800 dark:text-slate-200" : "text-slate-500 dark:text-slate-400"
              )}>
                {chk.label}
              </span>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{chk.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
