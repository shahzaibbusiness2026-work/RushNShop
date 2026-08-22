'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  RotateCw, 
  Bell, 
  ChevronDown, 
  Menu, 
  Check, 
  CheckCheck, 
  Store, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  Sun,
  Moon,
  Plus,
  Trash2
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';
import AddStoreModal from './AddStoreModal';

interface HeaderProps {
  onMobileMenuClick: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export default function Header({ 
  onMobileMenuClick,
  sidebarCollapsed = false,
  onToggleSidebar
}: HeaderProps) {
  const { 
    stores,
    activeStoreId,
    activeStore, 
    activeStoreInfo,
    setActiveStore, 
    deleteStore,
    toasts, 
    unreadNotificationCount, 
    markNotificationsRead,
    setCommandMenuOpen,
    theme,
    toggleTheme,
    setTheme,
    showToast
  } = useStore();

  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [addStoreModalOpen, setAddStoreModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const storeRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (storeRef.current && !storeRef.current.contains(event.target as Node)) {
        setStoreDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Data Refreshed', 'Calculations and marketplace fees synchronized with TikTok Shop.', 'info');
    }, 600);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile menu toggle + Search bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <button
          onClick={() => setCommandMenuOpen(true)}
          className="w-full flex items-center px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700/60 border border-slate-200/70 dark:border-slate-700/70 rounded-xl text-slate-400 dark:text-slate-500 text-sm transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 text-xs sm:text-sm font-normal">Search anything...</span>
          </div>
        </button>
      </div>

      {/* Right actions: Theme Toggle, Store selector, Refresh, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark & Bright Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          title={theme === 'dark' ? 'Switch to Bright Theme' : 'Switch to Dark Theme'}
          aria-label={theme === 'dark' ? 'Switch to Bright Theme' : 'Switch to Dark Theme'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300 transition-transform duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-transform duration-200" />
          )}
        </button>

        {/* Store Selector Dropdown */}
        <div className="relative" ref={storeRef}>
          <button
            onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
          >
            <div className="w-5 h-5 rounded-md bg-slate-900 text-tiktok-cyan flex items-center justify-center text-[10px] font-bold">
              {activeStoreInfo?.region || 'TT'}
            </div>
            <span className="hidden md:inline font-medium text-slate-800 dark:text-slate-200">{activeStore}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {storeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>TikTok Stores ({stores.length})</span>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => {
                      setActiveStore(store.id);
                      setStoreDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left group cursor-pointer",
                      activeStoreId === store.id
                        ? "bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Store className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div className="truncate min-w-0">
                        <p className="truncate font-bold text-slate-900 dark:text-white">{store.name}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{store.handle || store.region} • {store.currencySymbol}{store.currency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {activeStoreId === store.id && (
                        <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                      )}
                      {stores.length > 1 && (
                        <button
                          type="button"
                          title={`Delete store "${store.name}"`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Are you sure you want to remove store "${store.name}" and its product data?`)) {
                              await deleteStore(store.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setStoreDropdownOpen(false);
                    setAddStoreModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/50 transition-colors text-left"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add TikTok Store</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sync / Refresh Button */}
        <button
          onClick={handleRefresh}
          title="Refresh Data & Rates"
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          <RotateCw className={cn("w-4 h-4 transition-transform", isRefreshing && "animate-spin text-brand-600")} />
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifDropdownOpen(!notifDropdownOpen);
              if (!notifDropdownOpen) markNotificationsRead();
            }}
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-tiktok-pink text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Notifications</span>
                  <span className="text-xs font-normal text-slate-400">({toasts.length})</span>
                </div>
                <button
                  onClick={markNotificationsRead}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5">
                {toasts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No recent notifications</div>
                ) : (
                  toasts.map((toast) => (
                    <div
                      key={toast.id}
                      className={cn(
                        "p-2.5 rounded-xl transition-colors text-left flex gap-2.5 items-start",
                        toast.read 
                          ? "bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400" 
                          : "bg-brand-50/60 dark:bg-brand-950/40 border border-brand-100/60 dark:border-brand-900/60 text-slate-900 dark:text-slate-200"
                      )}
                    >
                      <div className="mt-0.5">
                        {toast.type === 'success' && <TrendingUp className="w-4 h-4 text-emerald-600" />}
                        {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                        {toast.type === 'info' && <Sparkles className="w-4 h-4 text-brand-600" />}
                        {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold flex items-center justify-between">
                          <span>{toast.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{toast.timestamp}</span>
                        </div>
                        <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{toast.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-brand-100 dark:ring-brand-900">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Alex Johnson"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">Alex Johnson</span>
              <span className="text-[10px] font-medium text-slate-400 leading-tight">Seller</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Alex Johnson</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">alex@rushnshop.com</p>
                <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  Verified TikTok Merchant
                </div>
              </div>

              <a
                href="https://seller.tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>TikTok Seller Center</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href="/settings"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <span>Account & Store Rules</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Add TikTok Store Modal */}
      <AddStoreModal
        isOpen={addStoreModalOpen}
        onClose={() => setAddStoreModalOpen(false)}
      />
    </header>
  );
}
