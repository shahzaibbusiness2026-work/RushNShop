'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Store, 
  X, 
  Plus, 
  Sparkles, 
  Check, 
  Loader2, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { useStore, NewStorePayload } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

interface AddStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RegionOption {
  id: 'US' | 'UK' | 'EU' | 'CA' | 'AU' | 'GLOBAL';
  label: string;
  flag: string;
  curr: string;
  sym: string;
  defaultComm: number;
}

const REGIONS: RegionOption[] = [
  { id: 'US', label: 'United States', flag: '🇺🇸', curr: 'USD', sym: '$', defaultComm: 10.0 },
  { id: 'UK', label: 'United Kingdom', flag: '🇬🇧', curr: 'GBP', sym: '£', defaultComm: 9.0 },
  { id: 'EU', label: 'European Union', flag: '🇪🇺', curr: 'EUR', sym: '€', defaultComm: 9.5 },
  { id: 'CA', label: 'Canada', flag: '🇨🇦', curr: 'CAD', sym: '$', defaultComm: 10.0 },
  { id: 'AU', label: 'Australia', flag: '🇦🇺', curr: 'AUD', sym: '$', defaultComm: 10.0 },
  { id: 'GLOBAL', label: 'Global / Other', flag: '🌐', curr: 'USD', sym: '$', defaultComm: 10.0 },
];

export default function AddStoreModal({ isOpen, onClose }: AddStoreModalProps) {
  const { addStore } = useStore();
  const [mounted, setMounted] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [region, setRegion] = useState<RegionOption['id']>('US');
  const [currency, setCurrency] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [commission, setCommission] = useState<number | string>(10.0);
  const [withDemoData, setWithDemoData] = useState(true);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Portal mount check
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form whenever modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setHandle('');
      setRegion('US');
      setCurrency('USD');
      setCurrencySymbol('$');
      setCommission(10.0);
      setWithDemoData(true);
      setErrorMessage(null);
      setIsSubmitting(false);

      // Auto-focus first input
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!mounted || !isOpen) return null;

  const handleRegionSelect = (reg: RegionOption) => {
    setRegion(reg.id);
    setCurrency(reg.curr);
    setCurrencySymbol(reg.sym);
    setCommission(reg.defaultComm);
    setErrorMessage(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Store name is required. Please enter a name for your TikTok shop.');
      nameInputRef.current?.focus();
      return;
    }

    const cleanCommission = typeof commission === 'number' 
      ? commission 
      : parseFloat(String(commission)) || 10.0;

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: NewStorePayload = {
      name: trimmedName,
      handle: handle.trim() 
        ? (handle.startsWith('@') ? handle.trim() : `@${handle.trim()}`) 
        : `@${trimmedName.toLowerCase().replace(/\s+/g, '')}_shop`,
      region,
      currency,
      currencySymbol,
      tiktokCommissionPercent: cleanCommission,
      withDemoData,
    };

    try {
      await addStore(payload);
      onClose();
    } catch (err: any) {
      console.error('[AddStoreModal] Failed creating store:', err);
      setErrorMessage(err?.message || 'Unable to create store. Please check your network connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-store-modal-title"
    >
      {/* Viewport Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-200"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Container Card */}
      <div 
        className="relative w-full max-w-lg sm:max-w-xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 id="add-store-modal-title" className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                Add New Store
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select your store region and configure your basic store settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-colors shrink-0 disabled:opacity-50"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
            
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-100">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Error creating store</p>
                  <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Store Name Input */}
            <div>
              <label htmlFor="store-name-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Store Display Name <span className="text-rose-500">*</span></span>
                <span className="text-[11px] font-normal text-slate-400">e.g. My UK TikTok Shop</span>
              </label>
              <input
                ref={nameInputRef}
                id="store-name-input"
                type="text"
                required
                disabled={isSubmitting}
                placeholder="e.g. ViralGlow UK Store, CozyVibe Boutique"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:opacity-50"
              />
            </div>

            {/* TikTok Handle Input */}
            <div>
              <label htmlFor="store-handle-input" className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                TikTok Shop Handle (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
                <input
                  id="store-handle-input"
                  type="text"
                  disabled={isSubmitting}
                  placeholder="store_handle"
                  value={handle.replace(/^@/, '')}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Region Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                Marketplace Region & Currency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {REGIONS.map((reg) => {
                  const isSelected = region === reg.id;
                  return (
                    <button
                      type="button"
                      key={reg.id}
                      disabled={isSubmitting}
                      onClick={() => handleRegionSelect(reg)}
                      className={cn(
                        "p-3 rounded-2xl border text-left flex items-start justify-between transition-all duration-150 relative disabled:opacity-50",
                        isSelected
                          ? "border-brand-600 bg-brand-50/70 dark:bg-brand-950/60 ring-2 ring-brand-500/30 text-brand-950 dark:text-brand-200 shadow-2xs"
                          : "border-slate-200/90 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-xl shrink-0 leading-none">{reg.flag}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight truncate text-slate-900 dark:text-white">
                            {reg.label}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                            {reg.curr} ({reg.sym})
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0 ml-1 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TikTok Commission Fee Rate */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  TikTok Shop Commission
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Marketplace referral fee rate for this region</p>
              </div>
              <div className="relative w-28 shrink-0">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="50"
                  disabled={isSubmitting}
                  placeholder="10.0"
                  value={commission === undefined || commission === null ? '' : commission}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCommission(v === '' ? '' : parseFloat(v));
                  }}
                  className="w-full pr-8 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-50"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
              </div>
            </div>

            {/* Preload Demo Products Switch */}
            <div 
              onClick={() => !isSubmitting && setWithDemoData(!withDemoData)}
              className={cn(
                "p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none",
                withDemoData 
                  ? "bg-brand-50/50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-900" 
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs shadow-2xs shrink-0",
                  withDemoData ? "bg-brand-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-400"
                )}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Preload with Sample Demo Products</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {withDemoData 
                      ? "Will populate with starter products, listings, and orders" 
                      : "Starts with clean empty portfolio"}
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={withDemoData}
                disabled={isSubmitting}
                onChange={(e) => setWithDemoData(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer shrink-0 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Store...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>+ Create & Switch Store</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

