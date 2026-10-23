import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileDrawer } from './MobileDrawer';
import { CommandPalette } from './CommandPalette';
import { QuickCreateModal } from './QuickCreateModal';
import { useDemoMode } from '../../context/DemoModeContext';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const { isDemo } = useDemoMode();
  const navigate = useNavigate();

  const handleCreated = (type, item) => {
    if (type === 'project') {
      navigate(`/projects/${item.id}`);
    } else {
      navigate('/tasks');
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar (Desktop) */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <Topbar
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenQuickCreate={() => setQuickCreateOpen(true)}
        />

        {/* Evaluation Banner (Demo Mode) */}
        {isDemo && (
          <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-cyan-700 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2 overflow-hidden">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0 animate-pulse" />
              <span className="truncate">
                <strong>Demo Mode Active:</strong> Interactive local simulation with persistent state. Switch user perspectives anytime in the topbar.
              </span>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="hidden sm:flex items-center gap-1 hover:underline text-[11px] text-brand-100 whitespace-nowrap"
            >
              <span>Backend Connection Settings</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
