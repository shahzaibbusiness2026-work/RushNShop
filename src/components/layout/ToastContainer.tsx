'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useStore, ToastMessage } from '@/context/StoreContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOAST_DURATION_MS = 3000; // 3 seconds

interface ToastCardProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const remainingTimeRef = useRef(TOAST_DURATION_MS);
  const lastTickRef = useRef<number>(Date.now());

  useEffect(() => {
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      if (isPaused) {
        lastTickRef.current = Date.now();
        return;
      }

      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;

      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (remainingTimeRef.current / TOAST_DURATION_MS) * 100;
      setProgress(pct);

      if (remainingTimeRef.current <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [toast.id, onDismiss, isPaused]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "pointer-events-auto relative overflow-hidden p-4 rounded-2xl shadow-xl border flex items-start gap-3 bg-white dark:bg-slate-900 transition-all duration-200 animate-in slide-in-from-right-5 fade-in",
        toast.type === 'success' && "border-emerald-200 dark:border-emerald-900/60 shadow-emerald-500/5",
        toast.type === 'warning' && "border-amber-200 dark:border-amber-900/60 shadow-amber-500/5",
        toast.type === 'error' && "border-rose-200 dark:border-rose-900/60 shadow-rose-500/5",
        toast.type === 'info' && "border-brand-200 dark:border-brand-900/60 shadow-brand-500/5"
      )}
    >
      {/* 3-Second Countdown Progress Bar Line at the Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-75 ease-linear",
            toast.type === 'success' && "bg-emerald-500 dark:bg-emerald-400",
            toast.type === 'warning' && "bg-amber-500 dark:bg-amber-400",
            toast.type === 'error' && "bg-rose-500 dark:bg-rose-400",
            toast.type === 'info' && "bg-brand-600 dark:bg-brand-400"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Type Icon Badge */}
      <div className="mt-0.5 shrink-0">
        {toast.type === 'success' && (
          <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50 shadow-2xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
        {toast.type === 'warning' && (
          <div className="w-7 h-7 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50 shadow-2xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
        {toast.type === 'error' && (
          <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-200/50 dark:border-rose-800/50 shadow-2xs">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        {toast.type === 'info' && (
          <div className="w-7 h-7 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-200/50 dark:border-brand-800/50 shadow-2xs">
            <Info className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-xs font-bold leading-tight text-slate-900 dark:text-white">
          {toast.title}
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        title="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const { activeToasts, dismissToast } = useStore();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}
