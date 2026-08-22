'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Building2, 
  HelpCircle, 
  ArrowRight,
  TrendingUp,
  Percent,
  Layers,
  Users,
  ChevronDown,
  Calculator
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { SAAS_PLANS } from '@/lib/server/db';
import { SubscriptionTier } from '@/types';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const { currentUser, currentPlanTier, setUpgradeModalOpen, setAuthModalOpen } = useAuth();
  const { showToast } = useStore();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const plansToShow: SubscriptionTier[] = ['starter', 'pro', 'agency'];

  const faqs = [
    {
      q: 'Can I connect multiple TikTok Shop regions (US, UK, EU)?',
      a: 'Yes! Pro and Agency plans support multi-regional stores with automated regional currency formatting (USD $, GBP £, EUR €, CAD $, AUD $) and localized TikTok commission presets (e.g., 9% for UK, 10% for US).'
    },
    {
      q: 'How does the TikTok Shop unit economics calculator work?',
      a: 'RushNshop automatically breaks down your product supplier cost, courier shipping fee, packaging, TikTok marketplace commission (10%), transaction processing fee (2%), affiliate creator commissions, and TikTok Spark Ads CPA to calculate your exact net profit and break-even price per order.'
    },
    {
      q: 'Can I give access to my Virtual Assistants or team members?',
      a: 'Yes. The Agency plan includes team member seats. You can invite your staff or media buyers, assign specific store access, or lock profiles without exposing master billing credentials.'
    },
    {
      q: 'Can I change or cancel my subscription at any time?',
      a: 'Absolutely. You can upgrade, downgrade, or cancel your monthly or annual subscription anytime with 1 click from your Settings dashboard.'
    },
    {
      q: 'Do you offer a free trial?',
      a: 'Yes! Every new account gets instant access to our 7-day test drive so you can calculate margins and audit your TikTok products risk-free.'
    }
  ];

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setUpgradeModalOpen(true);
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent SaaS Pricing</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Supercharge Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">TikTok Shop</span> Profitability
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop guessing your margins. Track true unit economics, TikTok commissions, Ad CPA break-evens, and shipping revenue across all your stores.
        </p>

        {/* Billing Toggle */}
        <div className="pt-4 flex items-center justify-center">
          <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-2xl flex items-center gap-1 border border-slate-300/60 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setBillingInterval('monthly')}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all",
                billingInterval === 'monthly'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingInterval('annual')}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                billingInterval === 'annual'
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <span>Annual Billing</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white shadow-2xs">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plansToShow.map((tierKey) => {
          const plan = SAAS_PLANS[tierKey];
          const isPopular = plan.popular;
          const isCurrent = currentPlanTier === tierKey;
          const price = billingInterval === 'annual' ? plan.priceAnnual : plan.priceMonthly;

          return (
            <div
              key={tierKey}
              className={cn(
                "relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 border",
                isPopular
                  ? "bg-white dark:bg-slate-900 border-brand-500 ring-2 ring-brand-500/20 shadow-xl shadow-brand-500/5 md:-translate-y-2"
                  : "bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700"
              )}
            >
              {/* Badge */}
              {isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-sm uppercase tracking-wider">
                  {plan.badge || 'Most Popular'}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Your Active Plan
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[32px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-5 mb-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    ${price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    / month
                  </span>
                  {billingInterval === 'annual' && (
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold ml-1">
                      (billed annually)
                    </span>
                  )}
                </div>

                {/* Store Limit Box */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      TikTok Stores
                    </span>
                  </div>
                  <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                    Up to {plan.maxStores} Store{plan.maxStores > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    What's included:
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleSelectPlan(tierKey)}
                  className={cn(
                    "w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2",
                    isPopular
                      ? "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white shadow-brand-500/20"
                      : "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                  )}
                >
                  {isCurrent ? (
                    <span>Manage Subscription</span>
                  ) : (
                    <>
                      <span>Get Started with {plan.name.split(' ')[0]}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Matrix */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Compare Plan Capabilities
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detailed breakdown of calculation engines, store quotas, and enterprise tooling.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">Core Features</th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 text-center">Starter ($29/mo)</th>
                <th className="py-3 px-4 font-bold text-brand-600 dark:text-brand-400 text-center">Pro ($79/mo)</th>
                <th className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200 text-center">Agency ($199/mo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Max TikTok Shop Stores</td>
                <td className="py-3 px-4 text-center font-bold">1 Store</td>
                <td className="py-3 px-4 text-center font-bold text-brand-600 dark:text-brand-400">3 Stores</td>
                <td className="py-3 px-4 text-center font-bold">10 Stores</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">SKU Product Capacity</td>
                <td className="py-3 px-4 text-center">50 SKUs</td>
                <td className="py-3 px-4 text-center font-semibold text-brand-600 dark:text-brand-400">250 SKUs</td>
                <td className="py-3 px-4 text-center font-semibold">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Real-Time Unit Economics</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Break-Even Ad CPA Estimator</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">AI Margin & Pricing Advisor</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅ (Priority)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Bulk CSV Product Upload</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">Multi-User / VA Team Seats</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center text-slate-300">—</td>
                <td className="py-3 px-4 text-center font-bold text-emerald-600">Included (5 Staff)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">PDF / Google Sheets Export</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅</td>
                <td className="py-3 px-4 text-center">✅</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Everything you need to know about RushNshop SaaS subscriptions.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-white"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform shrink-0", isOpen && "rotate-180")} />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-10 bg-gradient-to-tr from-brand-900 via-indigo-900 to-slate-900 text-white text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-tiktok-cyan">
          <Calculator className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
          Ready to Master Your TikTok Shop Profit Margins?
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
          Join high-volume TikTok sellers who audit their product unit economics before launching ad campaigns.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleSelectPlan('pro')}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm shadow-md hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Start 7-Day Free Trial</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm transition-all"
          >
            Open Calculator Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
