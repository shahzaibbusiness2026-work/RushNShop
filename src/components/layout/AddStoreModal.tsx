'use client';

import React, { useState } from 'react';
import { 
  Store, 
  X, 
  Plus, 
  Sparkles
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStoreModal({ isOpen, onClose }: AddStoreModalProps) {
  const { addStore } = useStore();

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [region, setRegion] = useState<'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'GLOBAL'>('US');
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [commission, setCommission] = useState(10.0);
  const [withDemoData, setWithDemoData] = useState(true);

  if (!isOpen) return null;

  const regions = [
    { id: 'US', label: 'United States', flag: '🇺🇸', curr: 'USD', sym: '$', defaultComm: 10.0 },
    { id: 'UK', label: 'United Kingdom', flag: '🇬🇧', curr: 'GBP', sym: '£', defaultComm: 9.0 },
    { id: 'EU', label: 'European Union', flag: '🇪🇺', curr: 'EUR', sym: '€', defaultComm: 9.5 },
    { id: 'CA', label: 'Canada', flag: '🇨🇦', curr: 'CAD', sym: '$', defaultComm: 10.0 },
    { id: 'AU', label: 'Australia', flag: '🇦🇺', curr: 'AUD', sym: '$', defaultComm: 10.0 },
    { id: 'GLOBAL', label: 'Global / Other', flag: '🌐', curr: 'USD', sym: '$', defaultComm: 10.0 },
  ] as const;

  const handleRegionSelect = (reg: typeof regions[number]) => {
    setRegion(reg.id);
    setCurrency(reg.curr);
    setCurrencySymbol(reg.sym);
    setCommission(reg.defaultComm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addStore({
      name: name.trim(),
      handle: handle.trim() ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${name.toLowerCase().replace(/\s+/g, '')}_shop`,
      region,
      currency,
      currencySymbol,
      tiktokCommissionPercent: commission,
      withDemoData,
    });

    // Reset and close
    setName('');
    setHandle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add TikTok Shop</h3>
              <p className="text-xs text-slate-400">Connect a new TikTok store profile & product workspace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Store Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Store Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ViralGlow US, CozyVibe Boutique, TechSpark"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* TikTok Handle */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              TikTok Shop Handle (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">@</span>
              <input
                type="text"
                placeholder="store_handle"
                value={handle.replace(/^@/, '')}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Marketplace Region & Currency */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Marketplace Region & Currency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {regions.map((reg) => (
                <button
                  type="button"
                  key={reg.id}
                  onClick={() => handleRegionSelect(reg)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all",
                    region === reg.id
                      ? "border-brand-600 bg-brand-50/70 dark:bg-brand-950/70 ring-1 ring-brand-500 text-brand-950 dark:text-brand-200 font-bold"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  )}
                >
                  <span className="text-lg">{reg.flag}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold leading-tight truncate">{reg.label}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{reg.curr} ({reg.sym})</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TikTok Commission Fee Rate */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">TikTok Shop Commission</p>
              <p className="text-[11px] text-slate-400">Marketplace referral fee rate</p>
            </div>
            <div className="relative w-24">
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={commission}
                onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                className="w-full pr-7 pl-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
            </div>
          </div>

          {/* Preload Demo Products Switch */}
          <div 
            onClick={() => setWithDemoData(!withDemoData)}
            className={cn(
              "p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
              withDemoData 
                ? "bg-brand-50/50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900" 
                : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-2xs",
                withDemoData ? "bg-brand-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
              )}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Preload with Sample Demo Products</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {withDemoData ? "Will populate with starter products, listings, and orders" : "Starts with clean empty portfolio"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={withDemoData}
              onChange={(e) => setWithDemoData(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create & Switch Store</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
