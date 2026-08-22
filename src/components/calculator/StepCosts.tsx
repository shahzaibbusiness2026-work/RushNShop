'use client';

import React from 'react';
import { DollarSign, Truck, PackageCheck, Layers, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

interface StepCostsProps {
  onNext: () => void;
  onBack: () => void;
}

export default function StepCosts({ onNext, onBack }: StepCostsProps) {
  const { currentCalculator, updateCalculator, settings } = useStore();

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product Costs & Pricing</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Define your unit supplier cost, shipping, and target selling price.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Selling Price */}
        <div className="sm:col-span-2 p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900">
          <label className="block text-xs font-bold text-brand-950 dark:text-brand-300 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Target Selling Price (Retail) *
            </span>
            <span className="text-[11px] font-normal text-brand-700 dark:text-brand-400">What customer pays on TikTok Shop</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="29.99"
              value={currentCalculator.sellingPrice ?? ''}
              onChange={(e) => updateCalculator({ sellingPrice: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-900 border border-brand-200 dark:border-brand-800 rounded-xl text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Product Cost Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Product Unit Cost (Supplier) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="9.00"
              value={currentCalculator.costPrice ?? ''}
              onChange={(e) => updateCalculator({ costPrice: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Manufacturing or 1688 / AliExpress cost</span>
        </div>

        {/* Shipping Cost */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Shipping Cost
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="2.00"
              value={currentCalculator.shippingCost ?? settings.defaultShippingCost}
              onChange={(e) => updateCalculator({ shippingCost: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Domestic courier or 3PL delivery fee</span>
        </div>

        {/* Packaging Cost */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Packaging & Box Cost
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="1.00"
              value={currentCalculator.packagingCost ?? settings.defaultPackagingCost}
              onChange={(e) => updateCalculator({ packagingCost: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Box, bubble mailer, stickers, inserts</span>
        </div>

        {/* Other Product-Related Costs */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Other Product Costs
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
              {settings.currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={currentCalculator.otherProductCost ?? ''}
              onChange={(e) => updateCalculator({ otherProductCost: parseFloat(e.target.value) || 0 })}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Customs clearance, labels, inspection</span>
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
          <span>Next Step (Fees)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
