'use client';

import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Sparkles, 
  Check, 
  Layers, 
  DollarSign, 
  Percent, 
  Plus, 
  Trash2,
  ExternalLink 
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ListingModal({ isOpen, onClose }: ListingModalProps) {
  const { currentCalculator, currentCalculation, createListingFromProduct, settings, showToast } = useStore();
  const router = useRouter();

  const [title, setTitle] = useState(currentCalculator.name || 'Fast Wireless Charger 15W Qi-Certified');
  const [sku, setSku] = useState(currentCalculator.sku || 'WC-001');
  const [price, setPrice] = useState(currentCalculator.sellingPrice || 29.99);
  const [category, setCategory] = useState(currentCalculator.category ? `${currentCalculator.category} > Best Sellers` : 'Electronics > Cell Phone Accessories');
  const [description, setDescription] = useState(
    `Upgrade your daily charging routine with the high-performance ${currentCalculator.name || 'Wireless Charger'}. Engineered with intelligent temperature regulation, fast Qi wireless induction, and sleek modern aesthetic.`
  );
  const [features, setFeatures] = useState<string[]>([
    'Ultra-fast intelligent charging coil',
    'Compatible with iPhone, Samsung, and Qi devices',
    'Smart LED night-friendly status light',
    'High heat dissipation aluminum base'
  ]);
  const [newFeature, setNewFeature] = useState('');
  const [tags, setTags] = useState<string[]>(['#tiktokshop', '#viral', '#techfinds', '#musthave']);
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const formatted = newTag.startsWith('#') ? newTag.trim() : `#${newTag.trim()}`;
      setTags(prev => [...prev, formatted]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerateListing = async () => {
    await createListingFromProduct({
      ...currentCalculator,
      name: title,
      sku,
      sellingPrice: Number(price),
    });
    onClose();
    router.push('/listings');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Create TikTok Shop Listing</h3>
              <p className="text-xs text-white/80">Transfer calculator economics directly into listing draft</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Unit Economics Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-[11px] font-semibold text-slate-400">Selling Price</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{formatCurrency(price, settings.currencySymbol)}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400">Total Unit Cost</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{formatCurrency(currentCalculation.totalCostPerOrder, settings.currencySymbol)}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400">Expected Profit</span>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(currentCalculation.netProfit, settings.currencySymbol)}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400">Profit Margin</span>
              <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatPercent(currentCalculation.profitMarginPercent)}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Listing Title (Optimized for TikTok Search)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium uppercase text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">TikTok Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Product Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            {/* Key Features Bullet points */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Bullet Point Features</label>
              <div className="space-y-1.5 mb-2">
                {features.map((feat, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs">
                    <span className="text-slate-700 dark:text-slate-300">• {feat}</span>
                    <button onClick={() => handleRemoveFeature(i)} className="text-slate-400 hover:text-rose-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add feature bullet point..."
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                />
                <button
                  onClick={handleAddFeature}
                  className="px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-xs font-semibold hover:bg-slate-900"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viral Hashtags */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Viral Hashtags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 text-xs font-semibold">
                    {tag}
                    <button onClick={() => handleRemoveTag(i)} className="hover:text-brand-900 dark:hover:text-brand-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. #tiktokmademebuyit"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-brand-600 text-white rounded-lg text-xs font-semibold hover:bg-brand-700"
                >
                  Add Tag
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-semibold text-xs rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateListing}
            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Save & View Listings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
