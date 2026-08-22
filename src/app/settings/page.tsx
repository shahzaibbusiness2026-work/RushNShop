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
  CheckCircle2,
  Trash2,
  Plus,
  AlertTriangle,
  ArrowRight,
  Check,
  Users,
  Lock,
  Unlock,
  UserPlus,
  Shield,
  Mail,
  Key,
  CreditCard,
  Zap,
  TrendingUp,
  Crown,
  ExternalLink,
  RotateCw,
  Building2,
  Layers
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { StoreSettings, UserRole, SubscriptionTier } from '@/types';
import { SAAS_PLANS } from '@/lib/server/db';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import AddStoreModal from '@/components/layout/AddStoreModal';
import AddUserModal from '@/components/team/AddUserModal';

export default function SettingsPage() {
  const { 
    settings, 
    updateSettings, 
    resetSettings, 
    stores, 
    activeStoreId, 
    setActiveStore, 
    deleteStore, 
    showToast 
  } = useStore();

  const {
    currentUser,
    users,
    metrics,
    deleteUser,
    toggleLockUser,
    upgradePlan,
    refreshMetrics,
    canManageUsers,
    currentPlanTier,
    planMaxStores,
    setUpgradeModalOpen,
    isOwner
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'general' | 'stores' | 'team' | 'billing' | 'saas_hub' | 'costs' | 'rules' | 'ai'>('general');
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [addStoreModalOpen, setAddStoreModalOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [isUpgradingUser, setIsUpgradingUser] = useState<string | null>(null);

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
    const cleaned: StoreSettings = {
      ...formData,
      tiktokCommissionPercent: Number(formData.tiktokCommissionPercent) || 0,
      defaultShippingCost: Number(formData.defaultShippingCost) || 0,
      defaultPackagingCost: Number(formData.defaultPackagingCost) || 0,
      transactionFeePercent: Number(formData.transactionFeePercent) || 0,
      defaultAffiliatePercent: Number(formData.defaultAffiliatePercent) || 0,
      targetProfitMarginPercent: Number(formData.targetProfitMarginPercent) || 30,
      minimumAcceptableProfit: Number(formData.minimumAcceptableProfit) || 5,
      lowMarginThresholdPercent: Number(formData.lowMarginThresholdPercent) || 15,
    };
    updateSettings(cleaned);
  };

  const handleReset = () => {
    resetSettings();
    setFormData({ ...settings });
  };

  const handleDeleteStore = async (id: string, name: string) => {
    if (stores.length <= 1) {
      showToast('Cannot Delete', 'You must have at least one active store.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to permanently delete "${name}" and all its saved products?`)) {
      await deleteStore(id);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to remove user "${userName}"? Their access will be revoked.`)) {
      try {
        await deleteUser(userId);
        showToast('User Removed', `User "${userName}" has been removed.`, 'info');
      } catch (err: any) {
        showToast('Action Failed', err.message || 'Cannot delete this user.', 'error');
      }
    }
  };

  const handleToggleLock = async (userId: string, userName: string, currentLocked: boolean) => {
    const nextState = !currentLocked;
    await toggleLockUser(userId, nextState);
    showToast(
      nextState ? 'Profile Locked' : 'Profile Unlocked',
      `User "${userName}" profile ${nextState ? 'has been locked' : 'is now active'}.`,
      'info'
    );
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'stores', label: `Stores (${stores.length})` },
    { id: 'team', label: `Team (${users.length})` },
    { id: 'billing', label: 'Subscription & Quotas' },
    ...(isOwner ? [{ id: 'saas_hub', label: '👑 SaaS Platform Hub' }] : []),
    { id: 'costs', label: 'Costs & Fees' },
    { id: 'rules', label: 'Profit Rules' },
    { id: 'ai', label: 'AI Advisor' },
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

              {/* Danger Zone: Remove Store if multiple stores exist */}
              {stores.length > 1 && (
                <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
                  <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        Danger Zone: Delete Active Store
                      </h4>
                      <p className="text-[11px] text-rose-700/80 dark:text-rose-400/70 mt-0.5">
                        Permanently remove <strong>{formData.storeName}</strong> and all its calculations from the system.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteStore(activeStoreId, formData.storeName)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Store</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. STORES MANAGEMENT TAB */}
          {activeTab === 'stores' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">TikTok Store Portfolio</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage, switch between, or permanently remove your regional store profiles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddStoreModalOpen(true)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add TikTok Store</span>
                </button>
              </div>

              <div className="space-y-3">
                {stores.map((s) => {
                  const isActive = s.id === activeStoreId;
                  return (
                    <div
                      key={s.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                        isActive 
                          ? "bg-brand-50/50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800/80 ring-1 ring-brand-500/20" 
                          : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-tiktok-cyan flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {s.region || 'TT'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{s.name}</h4>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                                ● Active Store
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {s.handle || `@${s.name.toLowerCase()}`} • Region: <strong>{s.region}</strong> • Currency: <strong>{s.currencySymbol} {s.currency}</strong> • {s.products?.length || 0} Products
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveStore(s.id);
                              showToast('Store Switched', `Now managing "${s.name}".`, 'info');
                            }}
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <span>Switch</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={stores.length <= 1}
                          onClick={() => handleDeleteStore(s.id, s.name)}
                          title={stores.length <= 1 ? "Cannot delete the only remaining store" : `Remove "${s.name}"`}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors",
                            stores.length <= 1 
                              ? "opacity-30 cursor-not-allowed text-slate-400" 
                              : "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60"
                          )}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. TEAM & USERS MANAGEMENT TAB */}
          {activeTab === 'team' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Team Members & Client Accounts</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invite teammates, grant access to specific regional stores with individual emails and passwords, or lock sensitive profiles.
                  </p>
                </div>
                {canManageUsers && (
                  <button
                    type="button"
                    onClick={() => setAddUserModalOpen(true)}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Add Team Member</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isUserOwner = u.role === 'owner';
                  return (
                    <div
                      key={u.id}
                      className={cn(
                        "p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                        isCurrent
                          ? "bg-brand-50/40 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800 ring-1 ring-brand-500/20"
                          : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300"
                      )}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                          alt={u.name}
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{u.name}</h4>
                            
                            {/* Role Badge */}
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                              u.role === 'owner' 
                                ? "bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800"
                                : u.role === 'admin'
                                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                : u.role === 'store_manager'
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            )}>
                              {u.role.replace('_', ' ')}
                            </span>

                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shrink-0">
                                You
                              </span>
                            )}

                            {u.isLocked && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1 shrink-0">
                                <Lock className="w-2.5 h-2.5" />
                                Locked Profile
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {u.email}
                            </span>
                            <span>•</span>
                            <span>
                              Store Scope: <strong>
                                {u.assignedStoreIds?.includes('*') 
                                  ? 'All Stores' 
                                  : `${u.assignedStoreIds?.length || 0} Assigned Store(s)`}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {canManageUsers && !isUserOwner && (
                        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                          {/* Lock / Unlock Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleLock(u.id, u.name, Boolean(u.isLocked))}
                            title={u.isLocked ? "Unlock this profile" : "Lock this profile"}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border",
                              u.isLocked
                                ? "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                            )}
                          >
                            {u.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            <span>{u.isLocked ? 'Unlock' : 'Lock Profile'}</span>
                          </button>

                          {/* Remove User */}
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              title={`Remove user "${u.name}"`}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/60 flex items-center gap-1 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. SUBSCRIPTION & BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Active Subscription Plan</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 uppercase">
                      {isOwner ? '👑 Lifetime Master' : `${currentPlanTier} Plan`}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Manage your TikTok Shop store quotas, billing interval, and receipts.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUpgradeModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isOwner ? 'Manage Master Plan' : '⚡ Upgrade / Change Plan'}</span>
                </button>
              </div>

              {/* Plan Overview Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-brand-50/50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-brand-100/80 dark:border-slate-800 shadow-xs space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-sm shadow-brand-500/20">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {isOwner ? 'Master Platform Owner Access' : SAAS_PLANS[currentPlanTier]?.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isOwner 
                          ? 'Unlimited TikTok stores and administrative authority' 
                          : `$${SAAS_PLANS[currentPlanTier]?.priceMonthly || 0}/month • Renews automatically`}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      ● Active Subscription
                    </span>
                  </div>
                </div>

                {/* Quota Gauges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Store Quota */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        Connected Stores
                      </span>
                      <span className="font-extrabold text-brand-600 dark:text-brand-400">
                        {stores.length} / {isOwner ? 'Unlimited' : planMaxStores}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-brand-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (stores.length / (isOwner ? 10 : planMaxStores)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      {isOwner 
                        ? 'Unlimited store slots available' 
                        : `${planMaxStores - stores.length > 0 ? planMaxStores - stores.length : 0} store slot(s) remaining`}
                    </p>
                  </div>

                  {/* SKU Product Quota */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Active SKU Calculations
                      </span>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                        {stores.reduce((acc, s) => acc + (s.products?.length || 0), 0)} / {isOwner ? 'Unlimited' : SAAS_PLANS[currentPlanTier]?.maxProducts || 50}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (stores.reduce((acc, s) => acc + (s.products?.length || 0), 0) / (isOwner ? 100 : SAAS_PLANS[currentPlanTier]?.maxProducts || 50)) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      Full unit economics and break-even auditing
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoices List */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    Billing & Payment Receipts
                  </h4>
                  <span className="text-[11px] text-slate-400">Powered by Stripe Billing</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {isOwner ? 'Master Platform License' : `${SAAS_PLANS[currentPlanTier]?.name} Subscription`}
                      </p>
                      <p className="text-[11px] text-slate-400">Paid via Credit Card (•••• 4242) • Today</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {isOwner ? '$0.00' : `$${SAAS_PLANS[currentPlanTier]?.priceMonthly || 0}.00`}
                      </span>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Paid ✓</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. SUPER-ADMIN SAAS PLATFORM HUB */}
          {activeTab === 'saas_hub' && isOwner && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500" />
                    <span>SaaS Business & Revenue Hub</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live revenue metrics and client subscription management for RushNshop.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={refreshMetrics}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Refresh Revenue</span>
                </button>
              </div>

              {/* Revenue Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-200 dark:border-emerald-900/60 bg-white dark:bg-slate-900">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Monthly Recurring Revenue
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                    ${metrics?.totalMRR || 0}
                    <span className="text-xs font-bold text-slate-400 ml-1">/ mo</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Live active subscriber billing</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-500/10 to-transparent border border-brand-200 dark:border-brand-900/60 bg-white dark:bg-slate-900">
                  <p className="text-xs font-bold text-brand-700 dark:text-brand-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Paying Subscribers
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                    {metrics?.activeSubscribers || 0}
                    <span className="text-xs font-bold text-slate-400 ml-1">accounts</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Starter ({metrics?.planBreakdown?.starter || 0}) • Pro ({metrics?.planBreakdown?.pro || 0}) • Agency ({metrics?.planBreakdown?.agency || 0})
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900">
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    Total Managed Stores
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">
                    {stores.length}
                    <span className="text-xs font-bold text-slate-400 ml-1">stores</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Across all client workspaces</p>
                </div>
              </div>

              {/* Client Subscription Management Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tenant Accounts & Plan Allocations ({users.length})
                </h4>

                <div className="space-y-2.5">
                  {users.map((u) => {
                    const isUserOwner = u.role === 'owner';
                    const userTier = isUserOwner ? 'lifetime_owner' : (u.subscription?.tier || 'starter');

                    return (
                      <div
                        key={u.id}
                        className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`}
                            alt={u.name}
                            className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                {u.name}
                              </p>
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                                userTier === 'agency'
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200"
                                  : userTier === 'pro'
                                  ? "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300 border-brand-200"
                                  : userTier === 'starter'
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200"
                              )}>
                                {userTier}
                              </span>
                              {u.isLocked && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                                  Locked
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                          </div>
                        </div>

                        {/* Admin Action Controls */}
                        {!isUserOwner && (
                          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                            {/* Plan Change Selector */}
                            <select
                              value={userTier}
                              onChange={async (e) => {
                                const newTier = e.target.value as SubscriptionTier;
                                setIsUpgradingUser(u.id);
                                try {
                                  await apiClient.upgradeSubscription(u.id, newTier);
                                  await refreshMetrics();
                                  showToast('Plan Updated', `Changed ${u.name}'s subscription to ${newTier.toUpperCase()}.`, 'success');
                                } catch (err: any) {
                                  showToast('Update Failed', err.message || 'Cannot update tier.', 'error');
                                } finally {
                                  setIsUpgradingUser(null);
                                }
                              }}
                              disabled={isUpgradingUser === u.id}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500"
                            >
                              <option value="trial">7-Day Trial (1 Store)</option>
                              <option value="starter">Starter ($29/mo - 1 Store)</option>
                              <option value="pro">Pro ($79/mo - 3 Stores)</option>
                              <option value="agency">Agency ($199/mo - 10 Stores)</option>
                            </select>

                            {/* Lock Toggle */}
                            <button
                              type="button"
                              onClick={() => handleToggleLock(u.id, u.name, Boolean(u.isLocked))}
                              className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                                u.isLocked 
                                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                              )}
                            >
                              {u.isLocked ? 'Unlock' : 'Lock'}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
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
                      placeholder="10.0"
                      value={formData.tiktokCommissionPercent === undefined || formData.tiktokCommissionPercent === null ? '' : formData.tiktokCommissionPercent}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('tiktokCommissionPercent', v === '' ? ('' as any) : parseFloat(v));
                      }}
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
                      placeholder="2.50"
                      value={formData.defaultShippingCost === undefined || formData.defaultShippingCost === null ? '' : formData.defaultShippingCost}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('defaultShippingCost', v === '' ? ('' as any) : parseFloat(v));
                      }}
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
                      placeholder="1.00"
                      value={formData.defaultPackagingCost === undefined || formData.defaultPackagingCost === null ? '' : formData.defaultPackagingCost}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('defaultPackagingCost', v === '' ? ('' as any) : parseFloat(v));
                      }}
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
                      placeholder="2.0"
                      value={formData.transactionFeePercent === undefined || formData.transactionFeePercent === null ? '' : formData.transactionFeePercent}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('transactionFeePercent', v === '' ? ('' as any) : parseFloat(v));
                      }}
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
                      placeholder="5.0"
                      value={formData.defaultAffiliatePercent === undefined || formData.defaultAffiliatePercent === null ? '' : formData.defaultAffiliatePercent}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('defaultAffiliatePercent', v === '' ? ('' as any) : parseFloat(v));
                      }}
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
                      placeholder="30"
                      value={formData.targetProfitMarginPercent === undefined || formData.targetProfitMarginPercent === null ? '' : formData.targetProfitMarginPercent}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('targetProfitMarginPercent', v === '' ? ('' as any) : parseFloat(v));
                      }}
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
                      placeholder="5.00"
                      value={formData.minimumAcceptableProfit === undefined || formData.minimumAcceptableProfit === null ? '' : formData.minimumAcceptableProfit}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('minimumAcceptableProfit', v === '' ? ('' as any) : parseFloat(v));
                      }}
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
                      placeholder="15"
                      value={formData.lowMarginThresholdPercent === undefined || formData.lowMarginThresholdPercent === null ? '' : formData.lowMarginThresholdPercent}
                      onChange={(e) => {
                        const v = e.target.value;
                        handleInputChange('lowMarginThresholdPercent', v === '' ? ('' as any) : parseFloat(v));
                      }}
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

      {/* Add Store Modal */}
      <AddStoreModal
        isOpen={addStoreModalOpen}
        onClose={() => setAddStoreModalOpen(false)}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
      />
    </div>
  );
}
