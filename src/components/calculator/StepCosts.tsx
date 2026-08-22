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
              value={currentCalculator.sellingPrice === undefined || currentCalculator.sellingPrice === null ? '' : currentCalculator.sellingPrice}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ sellingPrice: v === '' ? ('' as any) : parseFloat(v) });
              }}
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
              value={currentCalculator.costPrice === undefined || currentCalculator.costPrice === null ? '' : currentCalculator.costPrice}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ costPrice: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Manufacturing or 1688 / AliExpress cost</span>
        </div>

        {/* Packaging & Box Cost */}
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
              value={currentCalculator.packagingCost === undefined || currentCalculator.packagingCost === null ? '' : currentCalculator.packagingCost}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ packagingCost: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Box, bubble mailer, stickers, inserts</span>
        </div>

        {/* SHIPMENT & FULFILLMENT ECONOMICS BREAKDOWN */}
        <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">Shipping & Fulfillment Breakdown</span>
            </div>
            {/* Live Net Shipping Badge */}
            {(() => {
              const cost = Number(currentCalculator.shippingCost ?? settings.defaultShippingCost) || 0;
              const charge = Number(currentCalculator.shippingCharge ?? 0) || 0;
              const diff = charge - cost;
              return (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  diff > 0 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : diff === 0
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}>
                  {diff > 0 
                    ? `Shipping Profit: +${settings.currencySymbol}${diff.toFixed(2)}` 
                    : diff === 0 
                    ? 'Shipping Break-Even'
                    : `Shipping Cost to Seller: -${settings.currencySymbol}${Math.abs(diff).toFixed(2)}`}
                </span>
              );
            })()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Outbound Shipping / 3PL Cost (Paid by Seller) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Seller Shipping Cost (3PL / Courier)</span>
                <span className="text-[10px] text-slate-400 font-normal">What you pay carrier</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="2.50"
                  value={currentCalculator.shippingCost === undefined || currentCalculator.shippingCost === null ? '' : currentCalculator.shippingCost}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateCalculator({ shippingCost: v === '' ? ('' as any) : parseFloat(v) });
                  }}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Customer Shipping Charge (Charged on TikTok Shop) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Customer Shipping Charge</span>
                <span className="text-[10px] text-slate-400 font-normal">$0.00 if Free Shipping</span>
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
                  value={currentCalculator.shippingCharge === undefined || currentCalculator.shippingCharge === null ? '' : currentCalculator.shippingCharge}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateCalculator({ shippingCharge: v === '' ? ('' as any) : parseFloat(v) });
                  }}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
            💡 TikTok Shop charges marketplace fees on Gross Revenue (Product Price + Customer Shipping Charge). If offering Free Shipping, leave Customer Shipping Charge at \$0.00.
          </p>
        </div>

        {/* Other Product-Related Costs */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Other Product Costs (Optional)
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
              value={currentCalculator.otherProductCost === undefined || currentCalculator.otherProductCost === null ? '' : currentCalculator.otherProductCost}
              onChange={(e) => {
                const v = e.target.value;
                updateCalculator({ otherProductCost: v === '' ? ('' as any) : parseFloat(v) });
              }}
              className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Customs clearance, labels, inspection, barcode printing</span>
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
