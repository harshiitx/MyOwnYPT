'use client';

import { useStore } from '@/store/useStore';
import { motion } from 'framer-motion';
import { Timer, LayoutDashboard, Trophy, Settings } from 'lucide-react';

const TABS = [
  { id: 'timer' as const, label: 'Timer', icon: Timer },
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'achievements' as const, label: 'Awards', icon: Trophy },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

export default function Navbar() {
  const { activeTab, setActiveTab, isRunning } = useStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-surface/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-2xl mx-auto flex items-center justify-around px-2 py-2">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  <Icon size={20} />
                  {/* Recording indicator on timer tab */}
                  {tab.id === 'timer' && isRunning && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] font-medium relative">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for mobile */}
      <div className="bg-surface/80 h-safe-bottom" />
    </nav>
  );
}
