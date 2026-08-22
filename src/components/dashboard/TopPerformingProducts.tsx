'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { normalizeTimeRange } from '@/lib/timeSeries';
import { useRouter } from 'next/navigation';

export default function TopPerformingProducts() {
  const { products, settings, dateRange, loadProductIntoCalculator } = useStore();
  const router = useRouter();

  // Top products from current catalog or default mockup
  const topList = products.slice(0, 5);
  const timeKey = normalizeTimeRange(dateRange);

  const multiplier = timeKey === 'today' ? 12
    : timeKey === 'week' ? 45
    : timeKey === 'quarter' ? 520
    : timeKey === 'year' ? 1900
    : timeKey === 'all' ? 5500
    : 180;

  const handleProductClick = (productId: string) => {
    loadProductIntoCalculator(productId);
    router.push('/calculator');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-card flex flex-col justify-between transition-colors">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              Top Performing Products
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Ranked by overall net margin & unit volume
            </p>
          </div>
        </div>

        {/* Product Rows - Strict Scanning Hierarchy: Rank -> Product -> Margin -> Profit -> Action */}
        <div className="space-y-2.5 mt-2">
          {topList.map((product, index) => {
            // Calculate margins
            const totalFee = (product.sellingPrice * (product.tiktokCommissionPercent + product.transactionFeePercent + product.affiliatePercent)) / 100;
            const totalCost = product.costPrice + product.shippingCost + product.packagingCost + totalFee + product.tiktokAdsCost + product.creatorCost;
            const profit = product.sellingPrice - totalCost;
            const margin = product.sellingPrice > 0 ? (profit / product.sellingPrice) * 100 : 0;
            
            // Dynamic timeframe-scaled profit
            const estimatedTotalProfit = Math.max(0, Math.round(profit * Math.max(1, (multiplier - index * Math.round(multiplier * 0.12)))));

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200/60 dark:hover:border-slate-800 transition-all cursor-pointer group"
              >
                {/* 1. Rank & Product Info */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200/80 dark:border-slate-700">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-slate-900/90 text-white rounded-tl-md text-[9px] font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 truncate max-w-[140px] sm:max-w-[220px] transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                      {product.sku}
                    </p>
                  </div>
                </div>

                {/* 2. Margin Badge + 3. Estimated Profit + 4. Action Icon */}
                <div className="flex items-center gap-3 sm:gap-4 text-right shrink-0">
                  <span className="inline-block text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/50 dark:border-emerald-800/50 px-2 py-0.5 rounded-md shrink-0">
                    {formatPercent(margin)}
                  </span>
                  <div className="text-right min-w-[68px]">
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {formatCurrency(estimatedTotalProfit, settings.currencySymbol)}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Footer Link */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
        <Link
          href="/history"
          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 group py-1"
        >
          <span>View All Products</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
