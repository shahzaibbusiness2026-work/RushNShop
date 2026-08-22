'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Save,
  Store,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { StoreSettings } from '@/types';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, showToast } = useStore();

  const [activeTab, setActiveTab] = useState<'general' | 'costs' | 'rules' | 'ai'>('general');
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });

  React.useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleInputChange = <K extends keyof StoreSettings>(field: K, value: StoreSettings[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleReset = () => {
    resetSettings();
    setFormData({ ...settings });
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'costs', label: 'Costs & Fees' },
    { id: 'rules', label: 'Profit Rules' },
    { id: 'ai', label: 'AI Settings' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Manage your default values, platform fee percentages, and automated profit rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 px-6 border-b border-slate-100 dark:border-slate-800 text-xs sm:text-sm font-semibold overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "py-4 relative transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "text-brand-600 dark:text-brand-400 font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Form */}
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {/* 1. GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-5 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">TikTok Shop Profile</h3>
                <p className="text-xs text-slate-400 dark:text-slate-400">Basic merchant information and default display currency.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Store Display Name</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">TikTok Handle</label>
                  <input
                    type="text"
                    value={formData.storeHandle}
                    onChange={(e) => handleInputChange('storeHandle', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Currency Code</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => {
                      const code = e.target.value;
                      const sym = code === 'USD' ? '$' : code === 'GBP' ? '£' : code === 'EUR' ? '€' : '$';
                      handleInputChange('currency', code);
                      handleInputChange('currencySymbol', sym);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500 cursor-pointer"
                  >
                    <option value="USD">USD ($) - United States</option>
                    <option value="GBP">GBP (£) - United Kingdom</option>
                    <option value="EUR">EUR (€) - European Union</option>
                    <option value="CAD">CAD ($) - Canada</option>
                    <option value="AUD">AUD ($) - Australia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.currencySymbol}
                    onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. COSTS & FEES TAB */}
          {(activeTab === 'costs' || activeTab === 'general' || activeTab === 'rules') && (
            <div className={activeTab === 'costs' ? 'block' : activeTab === 'general' ? 'block pt-6 border-t border-slate-100 dark:border-slate-800' : 'block'}>
              {activeTab === 'costs' && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Default Costs & Platform Fees</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400">Pre-populate new product calculations with these standard values.</p>
                </div>
              )}

              <div className="space-y-4 max-w-2xl">
                {/* TikTok Shop Commission (%) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">TikTok Shop Commission (%)</label>
                    <p className="text-[11px] text-slate-400">Standard TikTok marketplace referral percentage</p>
                  </div>
                  <div className="relative w-28">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.tiktokCommissionPercent}
                      onChange={(e) => handleInputChange('tiktokCommissionPercent', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">%</span>
                  </div>
                </div>

                {/* Default Shipping Cost ($) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Shipping Cost</label>
                    <p className="text-[11px] text-slate-400">Average courier delivery fee per order</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.currencySymbol}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.defaultShippingCost}
                      onChange={(e) => handleInputChange('defaultShippingCost', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Default Packaging Cost ($) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Packaging Cost</label>
                    <p className="text-[11px] text-slate-400">Boxes, poly mailers, labels, stickers</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.currencySymbol}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.defaultPackagingCost}
                      onChange={(e) => handleInputChange('defaultPackagingCost', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Transaction Fee (%) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Transaction Fee (%)</label>
                    <p className="text-[11px] text-slate-400">Payment processor handling rate (e.g. Stripe, PayPal)</p>
                  </div>
                  <div className="relative w-28">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.transactionFeePercent}
                      onChange={(e) => handleInputChange('transactionFeePercent', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>

                {/* Default Affiliate Commission (%) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Affiliate Commission (%)</label>
                    <p className="text-[11px] text-slate-400">Percentage given to TikTok creator partners</p>
                  </div>
                  <div className="relative w-28">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.defaultAffiliatePercent}
                      onChange={(e) => handleInputChange('defaultAffiliatePercent', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. PROFIT RULES TAB */}
          {(activeTab === 'rules' || activeTab === 'general') && (
            <div className={activeTab === 'rules' ? 'block' : 'block pt-6 border-t border-slate-100 dark:border-slate-800'}>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profit Threshold Rules & Health Warnings</h3>
                <p className="text-xs text-slate-400">Set target benchmarks that trigger Excellent, Good, and Warning badges.</p>
              </div>

              <div className="space-y-4 max-w-2xl">
                {/* Target Profit Margin (%) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900">
                  <div>
                    <label className="text-xs font-bold text-emerald-950 dark:text-emerald-300">Target Profit Margin (%)</label>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Calculates the Recommended Selling Price</p>
                  </div>
                  <div className="relative w-28">
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="90"
                      value={formData.targetProfitMarginPercent}
                      onChange={(e) => handleInputChange('targetProfitMarginPercent', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 text-right focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">%</span>
                  </div>
                </div>

                {/* Minimum Acceptable Profit ($) */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Minimum Acceptable Profit ($)</label>
                    <p className="text-[11px] text-slate-400">Used to compute Max Affordable Ad CPA</p>
                  </div>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{formData.currencySymbol}</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.minimumAcceptableProfit}
                      onChange={(e) => handleInputChange('minimumAcceptableProfit', parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white text-right focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Low Margin Warning Threshold */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900">
                  <div>
                    <label className="text-xs font-bold text-amber-950 dark:text-amber-300">Low Margin Alert Threshold (%)</label>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">Triggers yellow warning badge below this margin</p>
                  </div>
                  <div className="relative w-28">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={formData.lowMarginThresholdPercent}
                      onChange={(e) => handleInputChange('lowMarginThresholdPercent', parseFloat(e.target.value) || 0)}
                      className="w-full pr-8 pl-3 py-2 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold text-amber-900 dark:text-amber-200 text-right focus:outline-none focus:border-amber-500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 text-xs font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. AI SETTINGS TAB */}
          {activeTab === 'ai' && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Intelligence Advisor Configuration</h3>
                <p className="text-xs text-slate-400">Configure automated suggestions, sensitivity triggers, and listing generation.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Automated Pricing Optimization Tips</p>
                    <p className="text-[11px] text-slate-400">Show dynamic price bump recommendations in comparison and calculator.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoAiTips}
                    onChange={(e) => handleInputChange('autoAiTips', e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-950 dark:text-brand-300">Active AI Model Engine</h4>
                  <p className="text-xs text-brand-700/90 dark:text-brand-400/90 mt-0.5 leading-relaxed">
                    RushNshop AI is configured with TikTok Shop specific unit economic reasoning algorithms, calculating exact break-even ceilings and ad spend ROAS.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Save Button */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
