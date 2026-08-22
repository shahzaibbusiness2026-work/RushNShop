'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandMenu from './CommandMenu';
import ToastContainer from './ToastContainer';
import AiAssistantDrawer from '../ai/AiAssistantDrawer';
import AuthModal from '../auth/AuthModal';
import { cn } from '@/lib/utils';

const LOCAL_STORAGE_KEY_COLLAPSED = 'rushnshop_sidebar_collapsed_v1';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_COLLAPSED);
      if (stored !== null) {
        setSidebarCollapsed(stored === 'true');
      }
    } catch (e) {}
  }, []);

  const handleToggleCollapse = (valOrFn: boolean | ((prev: boolean) => boolean)) => {
    setSidebarCollapsed(prev => {
      const next = typeof valOrFn === 'function' ? valOrFn(prev) : valOrFn;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_COLLAPSED, String(next));
      } catch (e) {}
      return next;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FD] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar navigation */}
      <Sidebar 
        mobileOpen={mobileSidebarOpen} 
        setMobileOpen={setMobileSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={handleToggleCollapse}
      />

      {/* Main Content Area with dynamic padding for collapsed sidebar */}
      <div className={cn(
        "flex flex-col flex-1 min-w-0 transition-all duration-300",
        sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
      )}>
        <Header 
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => handleToggleCollapse(prev => !prev)}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandMenu />
      <AiAssistantDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}
