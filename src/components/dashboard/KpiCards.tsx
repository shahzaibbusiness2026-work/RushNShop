'use client';

import React from 'react';
import { 
  Package, 
  Percent, 
  DollarSign, 
  Trophy, 
  AlertOctagon, 
  TrendingUp, 
  TrendingDown 
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { getTimeframeData } from '@/lib/timeSeries';

export default function KpiCards() {
  const { products, settings, monthlyData, dateRange } = useStore();

  const { kpis: dynamicKpis } = React.useMemo(() => {
    return getTimeframeData(dateRange, products, settings, monthlyData);
  }, [dateRange, products, settings, monthlyData]);

  const kpis = [
    {
      title: 'Products / Units Analyzed',
      value: formatNumber(dynamicKpis.productsSold),
      change: `${dynamicKpis.profitChange} ${dynamicKpis.timeframeLabel}`,
      isPositive: true,
      icon: Package,
      iconBg: 'bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400',
    },
    {
      title: 'Average Profit Margin',
      value: `${dynamicKpis.avgMargin}%`,
      change: `Target: ${settings.targetProfitMarginPercent}%`,
      isPositive: dynamicKpis.avgMargin >= (settings.targetProfitMarginPercent || 35),
      icon: Percent,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Total Net Profit',
      value: formatCurrency(dynamicKpis.totalProfit, settings.currencySymbol),
      change: `${dynamicKpis.profitChange} ${dynamicKpis.timeframeLabel}`,
      isPositive: true,
      icon: DollarSign,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Winning Products',
      value: dynamicKpis.winningCount.toString(),
      change: `${Math.round((dynamicKpis.winningCount / Math.max(1, products.length)) * 100)}% of catalog`,
      isPositive: true,
      icon: Trophy,
      iconBg: 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Low Margin / Loss Alerts',
      value: dynamicKpis.lowMarginCount.toString(),
      change: dynamicKpis.lowMarginCount === 0 ? 'Optimal Portfolio' : 'Action Required',
      isPositive: dynamicKpis.lowMarginCount === 0,
      icon: AlertOctagon,
      iconBg: 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">
                  {kpi.value}
                </h3>
              </div>
              <div className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
              {kpi.isPositive ? (
                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  {kpi.change}
                </span>
              ) : (
                <span className="inline-flex items-center text-rose-500 dark:text-rose-400 gap-0.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {kpi.change}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
