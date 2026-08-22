'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Calculator, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink,
  Percent,
  DollarSign,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How are TikTok Shop commissions calculated in 2024/2025?',
      a: 'TikTok Shop charges a standard referral commission (typically 6% to 10% for US merchants depending on product category), plus payment processing transaction fees (usually ~2% + standard processing). Affiliate creator commissions are optional but typically set between 5% and 20% to incentivize viral creator showcases.',
    },
    {
      q: 'What is the Break-Even Price formula used by RushNshop?',
      a: 'The formula considers fixed per-unit costs (Product Cost + Shipping + Packaging + Paid Ad CPA + Creator Fee) divided by (1 - [TikTok Commission % + Payment Fee % + Affiliate %] / 100). This provides the exact minimum price where net profit is exactly $0.00.',
    },
    {
      q: 'What is your Maximum Affordable Ad CPA?',
      a: 'Your Maximum Affordable Ad CPA is the maximum amount you can spend per paid order while still ensuring you achieve at least your Minimum Acceptable Profit ($5.00 by default). It is calculated as: Selling Price - (Total Product Costs + TikTok % Fees + Minimum Target Profit).',
    },
    {
      q: 'How does the Listing Generator transfer data?',
      a: 'Once your product profitability is calculated, clicking "Create Listing" carries your target retail price, calculated SKU, margins, and automatically writes viral TikTok SEO tags and bullet points ready for TikTok Seller Center.',
    },
    {
      q: 'Can I manage multiple TikTok Shop regional currencies?',
      a: 'Yes! You can add US ($), UK (£), EU (€), Canada ($), and Global stores via the Add Store modal. When you switch stores, all formulas, listings, orders, and charts instantly update with that region\'s currency and commission rules.',
    },
  ];

  const formulas = [
    {
      title: 'Net Profit per Unit',
      formula: 'Net Profit = Selling Price - Total Order Costs',
      desc: 'Total Costs include COGS, 3PL shipping, packaging, TikTok commission %, payment fee %, affiliate %, and ad CPA spend.',
    },
    {
      title: 'Profit Margin Percentage',
      formula: 'Margin (%) = (Net Profit / Selling Price) × 100',
      desc: 'The proportion of every revenue dollar retained as actual net profit. Target ≥ 35%.',
    },
    {
      title: 'Break-Even Selling Price',
      formula: 'Break-Even = Fixed Costs / (1 - Variable Fee Rate %)',
      desc: 'The lowest possible price you can sell at without losing money on TikTok fees.',
    },
    {
      title: 'Max Affordable Ad Spend (CPA)',
      formula: 'Max CPA = Revenue - (Costs + Fees + Minimum Target Profit)',
      desc: 'The absolute ceiling for your TikTok Spark Ads or shopping ads conversion cost.',
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Help Center & TikTok Seller Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Master TikTok Shop unit economics, marketplace fee structures, and profit calculation formulas.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Calculator className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Profit Margin Guide</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Understand how supplier costs, 3PL shipping, and return contingencies impact your true bottom line.
          </p>
          <Link href="/calculator" className="inline-flex items-center text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 gap-1 pt-1">
            <span>Open Calculator</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Official TikTok Shop Rates</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Stay up to date with the latest TikTok Shop fee updates, co-funded shipping discounts, and affiliate terms.
          </p>
          <a href="https://seller.tiktok.com" target="_blank" rel="noreferrer" className="inline-flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 gap-1 pt-1">
            <span>TikTok Seller Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">AI Profit Intelligence</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Use the built-in AI Advisor to test hypothetical fee increases and optimize retail prices for winning products.
          </p>
          <Link href="/compare" className="inline-flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 gap-1 pt-1">
            <span>Compare Products</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Formula Cheat Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-card space-y-5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Mathematical Unit Economics Formulas</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formulas.map((item, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
              <code className="block text-[11px] font-mono font-bold text-brand-700 dark:text-brand-300 bg-brand-50/80 dark:bg-brand-950/80 px-2.5 py-1.5 rounded-lg border border-brand-100 dark:border-brand-900">
                {item.formula}
              </code>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h3>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div 
                key={i} 
                className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-850/80 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
