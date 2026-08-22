'use client';

import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Copy,
  DollarSign,
  TrendingUp,
  Store
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import ListingModal from '@/components/calculator/ListingModal';

export default function ListingsPage() {
  const { listings, settings, deleteListing, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const filtered = listings.filter(l => 
    l.productName.toLowerCase().includes(search.toLowerCase()) ||
    l.sku.toLowerCase().includes(search.toLowerCase()) ||
    l.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSyncToTikTok = (id: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      showToast('TikTok Shop Synced', 'Listing synced with TikTok Seller Center catalog.', 'success');
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            TikTok Shop Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Draft, review, and synchronize calculated profitable product listings directly to TikTok Shop.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Listing</span>
        </button>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-card overflow-hidden">
        {/* Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search listings by title, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>

        {/* Listings Grid / Table */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Tag className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No TikTok listings found</p>
              <p className="text-xs mt-1">Use the calculator to compute product margins and click &quot;Create Listing&quot;.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="p-5 sm:p-6 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider",
                      item.status === 'synced' && "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
                      item.status === 'ready' && "bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
                      item.status === 'draft' && "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    )}>
                      {item.status === 'synced' ? '✓ Synced on TikTok' : item.status === 'ready' ? 'Ready to Sync' : 'Draft'}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{item.sku}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.category}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">{item.productName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 max-w-2xl">{item.description}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/80 px-2 py-0.5 rounded-md border border-brand-100/50 dark:border-brand-900/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Economics Box & Actions */}
                <div className="flex items-center gap-6 self-end md:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-medium text-slate-400">Retail Price</span>
                    <p className="text-base font-black text-slate-900 dark:text-white">{formatCurrency(item.sellingPrice, settings.currencySymbol)}</p>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(item.expectedProfit, settings.currencySymbol)} ({formatPercent(item.expectedMargin)})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSyncToTikTok(item.id)}
                      disabled={syncingId === item.id}
                      className="px-3.5 py-2 bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", syncingId === item.id && "animate-spin")} />
                      <span>{syncingId === item.id ? 'Syncing...' : 'Sync TikTok'}</span>
                    </button>

                    <button
                      onClick={() => deleteListing(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                      title="Delete listing draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ListingModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
