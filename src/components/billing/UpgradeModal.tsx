'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Loader2,
  Building2,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { SAAS_PLANS } from '@/lib/server/db';
import { SubscriptionTier } from '@/types';
import { cn } from '@/lib/utils';

export default function UpgradeModal() {
  const { upgradeModalOpen, setUpgradeModalOpen, currentPlanTier, upgradePlan, currentUser } = useAuth();
  const { showToast } = useStore();
  const [mounted, setMounted] = useState(false);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('pro');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (upgradeModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isProcessing) {
          setUpgradeModalOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [upgradeModalOpen, isProcessing, setUpgradeModalOpen]);

  if (!mounted || !upgradeModalOpen) return null;

  const handleUpgrade = async () => {
    if (selectedTier === currentPlanTier) {
      setUpgradeModalOpen(false);
      return;
    }

    setIsProcessing(true);
    try {
      const success = await upgradePlan(selectedTier, billingInterval);
      if (success) {
        showToast(
          'Plan Upgraded Successfully! 🎉',
          `You are now on the ${SAAS_PLANS[selectedTier]?.name} plan (${billingInterval}).`,
          'success'
        );
        setUpgradeModalOpen(false);
      } else {
        showToast('Upgrade Failed', 'Unable to complete plan upgrade. Please try again.', 'error');
      }
    } catch (err: any) {
      showToast('Upgrade Error', err?.message || 'Failed to process upgrade.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const plansToShow: SubscriptionTier[] = ['starter', 'pro', 'agency'];

  const modalContent = (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={() => !isProcessing && setUpgradeModalOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-brand-900/10 via-indigo-900/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 id="upgrade-modal-title" className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Upgrade Your RushNshop Workspace
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  TikTok Shop SaaS
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Unlock multi-store management, AI unit economics advisor, bulk SKU uploads, and higher limits.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => !isProcessing && setUpgradeModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interval Selector */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-center">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all",
                billingInterval === 'monthly'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={cn(
                "px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5",
                billingInterval === 'annual'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plansToShow.map((tierKey) => {
              const plan = SAAS_PLANS[tierKey];
              const isCurrent = currentPlanTier === tierKey;
              const isSelected = selectedTier === tierKey;
              const price = billingInterval === 'annual' ? plan.priceAnnual : plan.priceMonthly;

              return (
                <div
                  key={tierKey}
                  onClick={() => !isProcessing && setSelectedTier(tierKey)}
                  className={cn(
                    "relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none",
                    isSelected
                      ? "border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 ring-2 ring-brand-500/40 shadow-sm"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700"
                  )}
                >
                  {/* Badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-600 text-white shadow-xs uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          Current Plan
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="mt-4 mb-4 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        ${price}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        / month
                      </span>
                      {billingInterval === 'annual' && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                          (billed yearly)
                        </span>
                      )}
                    </div>

                    {/* Store Quota Highlight */}
                    <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 mb-4 border border-slate-200/50 dark:border-slate-700/50">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                        Up to {plan.maxStores} TikTok Store{plan.maxStores > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Radio / Selection Indicator */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">
                      {isSelected ? 'Selected' : 'Click to select'}
                    </span>
                    <div className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                      isSelected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 dark:border-slate-600"
                    )}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            30-day money-back guarantee. Instant workspace activation.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setUpgradeModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={handleUpgrade}
              className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Activating Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {selectedTier === currentPlanTier ? 'Keep Current Plan' : `Upgrade to ${SAAS_PLANS[selectedTier]?.name}`}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
