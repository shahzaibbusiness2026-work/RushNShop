'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Calculator, 
  LayoutDashboard, 
  Package, 
  Tag, 
  BarChart3, 
  Settings, 
  Sparkles, 
  X,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CommandMenu() {
  const { 
    commandMenuOpen, 
    setCommandMenuOpen, 
    products, 
    loadProductIntoCalculator,
    setAiDrawerOpen 
  } = useStore();
  const [query, setQuery] = useState('');
  const router = useRouter();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
      if (e.key === 'Escape' && commandMenuOpen) {
        setCommandMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandMenuOpen, setCommandMenuOpen]);

  if (!commandMenuOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  const navigationItems = [
    { label: 'Go to Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Open Profit Calculator', path: '/calculator', icon: Calculator },
    { label: 'View Product History', path: '/history', icon: Package },
    { label: 'Compare Products Side-by-Side', path: '/compare', icon: TrendingUp },
    { label: 'TikTok Listings Manager', path: '/listings', icon: Tag },
    { label: 'Analytics & Economics', path: '/analytics', icon: BarChart3 },
    { label: 'Fee & Business Settings', path: '/settings', icon: Settings },
  ].filter(item => item.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelectProduct = (prodId: string) => {
    loadProductIntoCalculator(prodId);
    setCommandMenuOpen(false);
    router.push('/calculator');
  };

  const handleNavigate = (path: string) => {
    setCommandMenuOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search calculations, products, pages, or tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full py-4 px-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-sm focus:outline-none bg-transparent"
          />
          <button 
            onClick={() => setCommandMenuOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick AI Trigger */}
          <div 
            onClick={() => {
              setCommandMenuOpen(false);
              setAiDrawerOpen(true);
            }}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-brand-50 to-indigo-50/60 dark:from-slate-800 dark:to-slate-850 border border-brand-100/70 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Ask AI Profit Advisor</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Get instant pricing optimization and breakdown advice</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Saved Products */}
          {filteredProducts.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Saved Calculations ({filteredProducts.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredProducts.slice(0, 5).map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleSelectProduct(prod.id)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {prod.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">{prod.sku} • {prod.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">${prod.sellingPrice.toFixed(2)}</span>
                      <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200/40 dark:border-emerald-800/40">
                        Calc Profit
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pages / Navigation */}
          {navigationItems.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Navigation
              </div>
              <div className="space-y-1 mt-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <span>Use <strong>Esc</strong> to close</span>
          <span>RushNshop Intelligence v1.0</span>
        </div>
      </div>
    </div>
  );
}
