'use client';

import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, Shield, Store, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { UserRole } from '@/types';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const { addUser, users } = useAuth();
  const { stores, showToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('store_manager');
  const [allStores, setAllStores] = useState(true);
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleStore = (storeId: string) => {
    if (selectedStoreIds.includes(storeId)) {
      setSelectedStoreIds(prev => prev.filter(id => id !== storeId));
    } else {
      setSelectedStoreIds(prev => [...prev, storeId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all required fields.');
      return;
    }

    if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
      setError('A user with this email address already exists.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addUser({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password.trim(),
        role,
        assignedStoreIds: allStores ? ['*'] : selectedStoreIds.length > 0 ? selectedStoreIds : ['*'],
        isLocked,
      });

      showToast('User Created', `Added ${name} (${role}) with email ${email}.`, 'success');
      onClose();
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('store_manager');
      setAllStores(true);
      setSelectedStoreIds([]);
      setIsLocked(false);
    } catch (err: any) {
      setError(err.message || 'Failed creating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Team Member / Client</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Grant customized store access and security permissions.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              Role & Permissions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'admin', label: 'Admin', desc: 'Manage all stores & team' },
                { id: 'store_manager', label: 'Store Manager', desc: 'Manage assigned stores only' },
                { id: 'viewer', label: 'Viewer', desc: 'Read-only store view' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id as UserRole)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === r.id
                      ? 'bg-brand-50/80 dark:bg-brand-950/60 border-brand-500 text-brand-900 dark:text-brand-200 ring-1 ring-brand-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold">{r.label}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 leading-tight">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Store Access Isolation */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Store Access Scope</span>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={allStores}
                  onChange={(e) => setAllStores(e.target.checked)}
                  className="rounded text-brand-600 accent-brand-600"
                />
                <span>All Stores</span>
              </label>
            </div>

            {!allStores && (
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] text-slate-400">Select which stores this user can view and manage:</p>
                <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto">
                  {stores.map((s) => {
                    const isChecked = selectedStoreIds.includes(s.id);
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleToggleStore(s.id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                          isChecked
                            ? 'bg-brand-50/60 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700 text-brand-900 dark:text-brand-200 font-semibold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="w-5 h-5 rounded-md bg-slate-900 text-tiktok-cyan flex items-center justify-center text-[10px] font-bold shrink-0">
                            {s.region}
                          </div>
                          <span className="truncate">{s.name}</span>
                        </div>
                        {isChecked && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Locked Profile Option */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Lock Profile Editing</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">Prevent user from modifying system-wide settings or deleting products.</p>
            </div>
            <input
              type="checkbox"
              checked={isLocked}
              onChange={(e) => setIsLocked(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating User...' : 'Add Team Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
