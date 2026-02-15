'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getAchievementDef, RARITY_COLORS } from '@/lib/achievements';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function RewardToast() {
  const { newAchievements, dismissAchievement } = useStore();

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (newAchievements.length > 0) {
      const timer = setTimeout(() => {
        dismissAchievement(newAchievements[0]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newAchievements, dismissAchievement]);

  const currentId = newAchievements[0];
  const achievement = currentId ? getAchievementDef(currentId) : null;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none"
        >
          <div
            className="pointer-events-auto max-w-sm w-full bg-surface-light/90 backdrop-blur-xl rounded-2xl
                        border border-white/10 shadow-2xl shadow-primary/20 overflow-hidden"
          >
            {/* Rarity gradient top */}
            <div className={`h-1 bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]}`} />

            <div className="flex items-center gap-3 p-4">
              {/* Icon */}
              <motion.div
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface text-2xl"
                initial={{ rotate: -10, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
              >
                {achievement.icon}
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <p className="text-[10px] text-primary uppercase tracking-widest font-semibold mb-0.5">
                  🎉 Achievement Unlocked!
                </p>
                <p className="text-sm font-bold text-text-primary">{achievement.title}</p>
                <p className="text-xs text-text-secondary">{achievement.description}</p>
              </div>

              {/* Close */}
              <button
                onClick={() => dismissAchievement(achievement.id)}
                className="p-1 rounded-lg hover:bg-surface/50 text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Remaining count */}
            {newAchievements.length > 1 && (
              <div className="px-4 pb-2 text-center">
                <span className="text-[10px] text-text-secondary">
                  +{newAchievements.length - 1} more
                </span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
