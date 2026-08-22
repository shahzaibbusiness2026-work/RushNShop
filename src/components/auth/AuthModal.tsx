'use client';

import React, { useState } from 'react';
import { X, LogIn, Lock, Mail, Shield, Check, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

export default function AuthModal() {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    currentUser, 
    users, 
    login, 
    switchUser 
  } = useAuth();
  const { showToast } = useStore();

  const [tab, setTab] = useState<'login' | 'switch'>('switch');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await login(email.trim(), password.trim());
      if (res.success) {
        showToast('Welcome Back', 'Logged in successfully.', 'success');
        setAuthModalOpen(false);
        setEmail('');
        setPassword('');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSwitch = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target?.isLocked) {
      setError(`Account "${target.name}" is locked. Contact administrator.`);
      return;
    }
    switchUser(userId);
    showToast('Profile Switched', `Logged in as ${target?.name} (${target?.role}).`, 'info');
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Account & Authentication</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch profile or authenticate with credentials.</p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2">
          <button
            onClick={() => setTab('switch')}
            className={`pb-3 text-xs font-bold border-b-2 mr-6 transition-colors ${
              tab === 'switch'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Quick Profile Switch ({users.length})
          </button>
          <button
            onClick={() => setTab('login')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
              tab === 'login'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            Email & Password Sign In
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'switch' && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an account below to switch your live session:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {users.map((u) => {
                  const isActive = currentUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleQuickSwitch(u.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-brand-50/60 dark:bg-brand-950/50 border-brand-300 dark:border-brand-700 ring-1 ring-brand-500/30'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`} 
                          alt={u.name} 
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{u.name}</p>
                            {isActive && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 shrink-0">
                                Active
                              </span>
                            )}
                            {u.isLocked && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 shrink-0">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{u.email} • <strong className="uppercase">{u.role}</strong></p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isActive ? (
                          <Check className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin@rushnshop.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Password
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

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                Default Owner: <strong>admin@rushnshop.com</strong> / <strong>admin123</strong><br />
                Default Manager: <strong>manager@rushnshop.com</strong> / <strong>manager123</strong>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoading ? 'Signing In...' : 'Sign In to Account'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
