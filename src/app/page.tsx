'use client';

import { useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { getTheme, getWallpaper, getThemeCSSVars } from '@/lib/themes';
import Timer from '@/components/Timer';
import Dashboard from '@/components/Dashboard';
import Achievements from '@/components/Achievements';
import Settings from '@/components/Settings';
import Navbar from '@/components/Navbar';
import RewardToast from '@/components/RewardToast';
import { AnimatePresence, motion } from 'framer-motion';

export default function Home() {
  const { activeTab, settings, hydrate, hydrated } = useStore();

  // Hydrate from localStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Apply theme CSS variables
  const theme = useMemo(() => getTheme(settings.theme), [settings.theme]);
  const wallpaper = useMemo(() => getWallpaper(settings.wallpaper), [settings.wallpaper]);
  const themeVars = useMemo(() => getThemeCSSVars(theme), [theme]);

  // Apply theme CSS vars to document
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [themeVars]);

  // Loading state
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen min-h-dvh relative"
      style={{
        backgroundColor: `rgb(${theme.colors.surface})`,
      }}
    >
      {/* Wallpaper background */}
      {wallpaper.className && (
        <div className={`fixed inset-0 z-0 pointer-events-none ${wallpaper.className}`} />
      )}

      {/* Main Content */}
      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'timer' && <Timer />}
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'achievements' && <Achievements />}
            {activeTab === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <Navbar />

      {/* Achievement Toasts */}
      <RewardToast />
    </div>
  );
}
