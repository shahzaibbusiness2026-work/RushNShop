'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calculator, 
  Package, 
  Tag, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  Bot, 
  Sparkles, 
  Layers, 
  ArrowRight, 
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export default function Sidebar({ 
  mobileOpen = false, 
  setMobileOpen,
  collapsed = false,
  setCollapsed
}: SidebarProps) {
  const pathname = usePathname();
  const { setAiDrawerOpen } = useStore();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Calculator', href: '/calculator', icon: Calculator },
    { name: 'Products', href: '/history', icon: Package },
    { name: 'Listings', href: '/listings', icon: Tag },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Pricing & Plans', href: '/pricing', icon: Zap },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Help Center', href: '/help', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen?.(false)}
        />
      )}

      <aside className={cn(
        "fixed top-0 bottom-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-all duration-300",
        collapsed ? "lg:w-20" : "lg:w-64",
        mobileOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Top: Logo & Close/Collapse controls */}
        <div>
          <div className={cn(
            "h-16 flex items-center border-b border-slate-100/80 dark:border-slate-800 transition-all",
            collapsed ? "px-3 justify-center" : "px-5 justify-between"
          )}>
            <Link href="/" className="flex items-center gap-2.5 group min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="flex items-baseline overflow-hidden">
                  <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white truncate">
                    RushN<span className="text-brand-600 dark:text-brand-400">shop</span>
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse Toggle Button */}
            {setCollapsed && !mobileOpen && (
              <button 
                onClick={() => setCollapsed(prev => !prev)}
                title={collapsed ? "Expand Sidebar" : "Close / Collapse Sidebar"}
                className={cn(
                  "hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
                  collapsed && "mt-1"
                )}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}

            {/* Mobile Close Button */}
            {setMobileOpen && (
              <button 
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Close Sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className={cn("space-y-1.5", collapsed ? "p-2.5" : "p-4")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen?.(false)}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    "flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative",
                    collapsed && !mobileOpen ? "justify-center p-2.5" : "gap-3.5 px-3.5 py-2.5",
                    isActive
                      ? "bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-semibold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-colors shrink-0",
                    isActive 
                      ? "text-brand-600 dark:text-brand-400" 
                      : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )} />

                  {(!collapsed || mobileOpen) && (
                    <>
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 shrink-0" />
                      )}
                    </>
                  )}

                  {/* Floating tooltip on collapsed desktop mode */}
                  {collapsed && !mobileOpen && (
                    <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Assistant / Collapse Footer */}
        <div className={cn(collapsed ? "p-2 m-1" : "p-3 m-3 space-y-2")}>
          {(!collapsed || mobileOpen) ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-50/80 to-indigo-50/50 dark:from-slate-800 dark:to-slate-850 border border-brand-100/80 dark:border-slate-750">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    AI Assistant
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    Get AI suggestions to improve your profit
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAiDrawerOpen(true)}
                className="w-full mt-2 py-1.5 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-brand-600 dark:hover:bg-brand-600 hover:text-white dark:hover:text-white text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-200/60 dark:border-slate-700 hover:border-brand-600 shadow-2xs transition-all flex items-center justify-center gap-1.5 group"
              >
                <span>Ask Profit Advisor</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAiDrawerOpen(true)}
              title="Open AI Profit Advisor"
              className="w-full p-2.5 rounded-xl bg-brand-50 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors"
            >
              <Bot className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
