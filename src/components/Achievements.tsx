'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  ACHIEVEMENTS,
  RARITY_COLORS,
  RARITY_BORDER_COLORS,
  RARITY_GLOW,
  getAchievementsByCategory,
} from '@/lib/achievements';
import { AchievementCategory, AchievementDef } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Flame, Clock, Star, Crown, Lock } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES: { id: AchievementCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All', icon: <Trophy size={16} /> },
  { id: 'focus', label: 'Focus', icon: <Clock size={16} /> },
  { id: 'daily', label: 'Daily', icon: <Star size={16} /> },
  { id: 'streak', label: 'Streak', icon: <Flame size={16} /> },
  { id: 'lifetime', label: 'Lifetime', icon: <Crown size={16} /> },
];

export default function Achievements() {
  const { unlockedAchievements } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | 'all'>('all');

  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
  const unlockedMap = new Map(unlockedAchievements.map(a => [a.id, a]));

  const filteredAchievements = selectedCategory === 'all'
    ? ACHIEVEMENTS
    : getAchievementsByCategory(selectedCategory);

  // Sort: unlocked first (newest first), then locked
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = unlockedIds.has(a.id);
    const bUnlocked = unlockedIds.has(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    if (aUnlocked && bUnlocked) {
      return (unlockedMap.get(b.id)?.unlockedAt || 0) - (unlockedMap.get(a.id)?.unlockedAt || 0);
    }
    return 0;
  });

  const totalUnlocked = unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.length;
  const progress = (totalUnlocked / totalAchievements) * 100;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="px-4 py-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <h1 className="text-2xl font-bold text-text-primary mb-1">Achievements</h1>
      <p className="text-text-secondary text-sm mb-4">
        {totalUnlocked} / {totalAchievements} unlocked
      </p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-surface-light rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                         transition-all duration-200 ${
              selectedCategory === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-surface-light/50 text-text-secondary hover:text-text-primary border border-white/5'
            }`}
          >
            {cat.icon}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={selectedCategory}
      >
        {sortedAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={unlockedIds.has(achievement.id)}
            unlockedAt={unlockedMap.get(achievement.id)?.unlockedAt}
            variants={itemVariants}
          />
        ))}
      </motion.div>
    </div>
  );
}

function AchievementCard({
  achievement,
  isUnlocked,
  unlockedAt,
  variants,
}: {
  achievement: AchievementDef;
  isUnlocked: boolean;
  unlockedAt?: number;
  variants: any;
}) {
  return (
    <motion.div
      variants={variants}
      className={`relative rounded-2xl p-4 border transition-all duration-300 ${
        isUnlocked
          ? `bg-surface-light/70 backdrop-blur-sm ${RARITY_BORDER_COLORS[achievement.rarity]} shadow-lg ${RARITY_GLOW[achievement.rarity]}`
          : 'bg-surface-light/20 border-white/5 opacity-50'
      }`}
    >
      {/* Rarity indicator */}
      {isUnlocked && (
        <div
          className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]}`}
        />
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl ${
            isUnlocked ? 'bg-surface/50' : 'bg-surface/30'
          }`}
        >
          {isUnlocked ? achievement.icon : <Lock size={18} className="text-text-secondary/50" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`text-sm font-semibold truncate ${isUnlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
              {achievement.title}
            </h3>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                isUnlocked
                  ? `bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white`
                  : 'bg-surface text-text-secondary/60'
              }`}
            >
              {achievement.rarity}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">{achievement.description}</p>
          {isUnlocked && unlockedAt && (
            <p className="text-[10px] text-text-secondary/60 mt-1">
              Unlocked {format(new Date(unlockedAt), 'MMM d, yyyy')}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
