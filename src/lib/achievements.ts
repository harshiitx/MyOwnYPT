// ==========================================
// Achievement System
// ==========================================

import { AchievementDef, StudySession, UnlockedAchievement } from './types';
import {
  getDailySummary,
  getStudyDate,
  getStreakInfo,
  getConsecutiveDaysWithMinHours,
} from './utils';

// ---- Achievement Definitions ----

export const ACHIEVEMENTS: AchievementDef[] = [
  // ===== FOCUS ACHIEVEMENTS (Continuous study session) =====
  {
    id: 'focus_first',
    title: 'First Step',
    description: 'Complete your first study session',
    icon: '🌱',
    category: 'focus',
    rarity: 'common',
  },
  {
    id: 'focus_15m',
    title: 'Warming Up',
    description: 'Study for 15 minutes straight',
    icon: '🔥',
    category: 'focus',
    rarity: 'common',
  },
  {
    id: 'focus_30m',
    title: 'Half Hour Hero',
    description: 'Study for 30 minutes straight',
    icon: '⚡',
    category: 'focus',
    rarity: 'common',
  },
  {
    id: 'focus_1h',
    title: 'Hour Power',
    description: 'Study for 1 hour straight',
    icon: '💪',
    category: 'focus',
    rarity: 'uncommon',
  },
  {
    id: 'focus_1h30',
    title: 'Ninety Niner',
    description: 'Study for 1.5 hours straight',
    icon: '🎯',
    category: 'focus',
    rarity: 'uncommon',
  },
  {
    id: 'focus_2h',
    title: 'Deep Focus',
    description: 'Study for 2 hours straight',
    icon: '🧠',
    category: 'focus',
    rarity: 'rare',
  },
  {
    id: 'focus_3h',
    title: 'Marathon Mind',
    description: 'Study for 3 hours straight',
    icon: '🏃',
    category: 'focus',
    rarity: 'rare',
  },
  {
    id: 'focus_4h',
    title: 'Ultra Focus',
    description: 'Study for 4 hours straight',
    icon: '🦾',
    category: 'focus',
    rarity: 'epic',
  },
  {
    id: 'focus_5h',
    title: 'Unstoppable',
    description: 'Study for 5 hours straight',
    icon: '👑',
    category: 'focus',
    rarity: 'legendary',
  },

  // ===== DAILY ACHIEVEMENTS (Total study time in one day) =====
  {
    id: 'daily_30m',
    title: 'Day Starter',
    description: 'Study 30 minutes in a single day',
    icon: '☀️',
    category: 'daily',
    rarity: 'common',
  },
  {
    id: 'daily_1h',
    title: 'First Hour',
    description: 'Study 1 hour in a single day',
    icon: '📖',
    category: 'daily',
    rarity: 'common',
  },
  {
    id: 'daily_2h',
    title: 'Getting Serious',
    description: 'Study 2 hours in a single day',
    icon: '📚',
    category: 'daily',
    rarity: 'common',
  },
  {
    id: 'daily_3h',
    title: 'Half Day Scholar',
    description: 'Study 3 hours in a single day',
    icon: '🎒',
    category: 'daily',
    rarity: 'uncommon',
  },
  {
    id: 'daily_5h',
    title: 'Dedicated',
    description: 'Study 5 hours in a single day',
    icon: '🏅',
    category: 'daily',
    rarity: 'uncommon',
  },
  {
    id: 'daily_7h',
    title: 'Full Day Scholar',
    description: 'Study 7 hours in a single day',
    icon: '🎓',
    category: 'daily',
    rarity: 'rare',
  },
  {
    id: 'daily_10h',
    title: 'Study Machine',
    description: 'Study 10 hours in a single day',
    icon: '🤖',
    category: 'daily',
    rarity: 'epic',
  },
  {
    id: 'daily_12h',
    title: 'Legendary Day',
    description: 'Study 12 hours in a single day',
    icon: '⭐',
    category: 'daily',
    rarity: 'legendary',
  },

  // ===== STREAK ACHIEVEMENTS (Consecutive days) =====
  {
    id: 'streak_2d',
    title: 'Two Day Streak',
    description: 'Study 1+ hour for 2 consecutive days',
    icon: '🔗',
    category: 'streak',
    rarity: 'common',
  },
  {
    id: 'streak_3d',
    title: 'Hatrick',
    description: 'Study 1+ hour for 3 consecutive days',
    icon: '🎩',
    category: 'streak',
    rarity: 'common',
  },
  {
    id: 'streak_3d_3h',
    title: 'Consistent Performer',
    description: 'Study 3+ hours/day for 3 consecutive days',
    icon: '🔄',
    category: 'streak',
    rarity: 'uncommon',
  },
  {
    id: 'streak_5d',
    title: 'Workweek Warrior',
    description: 'Study 1+ hour for 5 consecutive days',
    icon: '⚔️',
    category: 'streak',
    rarity: 'uncommon',
  },
  {
    id: 'streak_7d',
    title: 'Week Champion',
    description: 'Study 1+ hour for 7 consecutive days',
    icon: '🏆',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: 'streak_7d_3h',
    title: 'Iron Week',
    description: 'Study 3+ hours/day for a full week',
    icon: '🛡️',
    category: 'streak',
    rarity: 'rare',
  },
  {
    id: 'streak_14d',
    title: 'Two Week Champion',
    description: 'Study 1+ hour for 14 consecutive days',
    icon: '💎',
    category: 'streak',
    rarity: 'epic',
  },
  {
    id: 'streak_30d',
    title: 'Month Master',
    description: 'Study 1+ hour for 30 consecutive days',
    icon: '🌟',
    category: 'streak',
    rarity: 'epic',
  },
  {
    id: 'streak_7d_5h',
    title: 'Beast Mode Week',
    description: 'Study 5+ hours/day for a full week',
    icon: '🦁',
    category: 'streak',
    rarity: 'epic',
  },
  {
    id: 'streak_60d',
    title: 'Diamond Discipline',
    description: 'Study 1+ hour for 60 consecutive days',
    icon: '💠',
    category: 'streak',
    rarity: 'legendary',
  },
  {
    id: 'streak_100d',
    title: 'Century Legend',
    description: 'Study 1+ hour for 100 consecutive days',
    icon: '🏛️',
    category: 'streak',
    rarity: 'legendary',
  },

  // ===== LIFETIME ACHIEVEMENTS (Total accumulated hours) =====
  {
    id: 'lifetime_1h',
    title: 'First Hour Total',
    description: 'Accumulate 1 hour of total study time',
    icon: '🎈',
    category: 'lifetime',
    rarity: 'common',
  },
  {
    id: 'lifetime_10h',
    title: '10 Hour Club',
    description: 'Accumulate 10 hours of total study time',
    icon: '🔟',
    category: 'lifetime',
    rarity: 'common',
  },
  {
    id: 'lifetime_25h',
    title: '25 Hour Club',
    description: 'Accumulate 25 hours of total study time',
    icon: '📊',
    category: 'lifetime',
    rarity: 'uncommon',
  },
  {
    id: 'lifetime_50h',
    title: '50 Hour Club',
    description: 'Accumulate 50 hours of total study time',
    icon: '🎖️',
    category: 'lifetime',
    rarity: 'uncommon',
  },
  {
    id: 'lifetime_100h',
    title: 'Centurion',
    description: 'Accumulate 100 hours of total study time',
    icon: '💯',
    category: 'lifetime',
    rarity: 'rare',
  },
  {
    id: 'lifetime_250h',
    title: 'Scholar',
    description: 'Accumulate 250 hours of total study time',
    icon: '🧙',
    category: 'lifetime',
    rarity: 'rare',
  },
  {
    id: 'lifetime_500h',
    title: 'Master',
    description: 'Accumulate 500 hours of total study time',
    icon: '🏰',
    category: 'lifetime',
    rarity: 'epic',
  },
  {
    id: 'lifetime_1000h',
    title: 'Grand Master',
    description: 'Accumulate 1000 hours of total study time',
    icon: '🌍',
    category: 'lifetime',
    rarity: 'legendary',
  },

  // ===== SPECIAL MILESTONES =====
  {
    id: 'sessions_10',
    title: 'Getting a Habit',
    description: 'Complete 10 study sessions',
    icon: '🔑',
    category: 'lifetime',
    rarity: 'common',
  },
  {
    id: 'sessions_50',
    title: 'Dedicated Learner',
    description: 'Complete 50 study sessions',
    icon: '📝',
    category: 'lifetime',
    rarity: 'uncommon',
  },
  {
    id: 'sessions_100',
    title: 'Session Centurion',
    description: 'Complete 100 study sessions',
    icon: '🎪',
    category: 'lifetime',
    rarity: 'rare',
  },
  {
    id: 'sessions_500',
    title: 'Session Master',
    description: 'Complete 500 study sessions',
    icon: '🗿',
    category: 'lifetime',
    rarity: 'epic',
  },
];

// ---- Achievement Checking ----

export function checkAchievements(
  sessions: StudySession[],
  alreadyUnlocked: UnlockedAchievement[],
  currentSessionDuration?: number // seconds, for the just-finished session
): string[] {
  const unlockedIds = new Set(alreadyUnlocked.map(a => a.id));
  const newlyUnlocked: string[] = [];

  const completedSessions = sessions.filter(s => s.endTime !== null);
  const today = getStudyDate();
  const todaySummary = getDailySummary(sessions, today);
  const streakInfo = getStreakInfo(sessions, 1);
  const totalHours = streakInfo.totalHoursAllTime;
  const sessionCount = completedSessions.length;

  // Get longest single session ever
  const longestSession = completedSessions.reduce(
    (max, s) => Math.max(max, s.duration),
    0
  );

  // Use the just-finished session or the longest ever
  const checkSessionDuration = currentSessionDuration
    ? Math.max(currentSessionDuration, longestSession)
    : longestSession;

  function unlock(id: string) {
    if (!unlockedIds.has(id)) {
      newlyUnlocked.push(id);
      unlockedIds.add(id);
    }
  }

  // ---- Focus achievements ----
  if (sessionCount > 0) unlock('focus_first');
  if (checkSessionDuration >= 15 * 60) unlock('focus_15m');
  if (checkSessionDuration >= 30 * 60) unlock('focus_30m');
  if (checkSessionDuration >= 60 * 60) unlock('focus_1h');
  if (checkSessionDuration >= 90 * 60) unlock('focus_1h30');
  if (checkSessionDuration >= 120 * 60) unlock('focus_2h');
  if (checkSessionDuration >= 180 * 60) unlock('focus_3h');
  if (checkSessionDuration >= 240 * 60) unlock('focus_4h');
  if (checkSessionDuration >= 300 * 60) unlock('focus_5h');

  // ---- Daily achievements ----
  if (todaySummary.totalSeconds >= 30 * 60) unlock('daily_30m');
  if (todaySummary.totalSeconds >= 1 * 3600) unlock('daily_1h');
  if (todaySummary.totalSeconds >= 2 * 3600) unlock('daily_2h');
  if (todaySummary.totalSeconds >= 3 * 3600) unlock('daily_3h');
  if (todaySummary.totalSeconds >= 5 * 3600) unlock('daily_5h');
  if (todaySummary.totalSeconds >= 7 * 3600) unlock('daily_7h');
  if (todaySummary.totalSeconds >= 10 * 3600) unlock('daily_10h');
  if (todaySummary.totalSeconds >= 12 * 3600) unlock('daily_12h');

  // ---- Streak achievements ----
  const streak1h = streakInfo.currentStreak;
  if (streak1h >= 2) unlock('streak_2d');
  if (streak1h >= 3) unlock('streak_3d');
  if (streak1h >= 5) unlock('streak_5d');
  if (streak1h >= 7) unlock('streak_7d');
  if (streak1h >= 14) unlock('streak_14d');
  if (streak1h >= 30) unlock('streak_30d');
  if (streak1h >= 60) unlock('streak_60d');
  if (streak1h >= 100) unlock('streak_100d');

  // Streak with higher daily minimums
  const consecutiveDays3h = getConsecutiveDaysWithMinHours(sessions, 3);
  if (consecutiveDays3h >= 3) unlock('streak_3d_3h');
  if (consecutiveDays3h >= 7) unlock('streak_7d_3h');

  const consecutiveDays5h = getConsecutiveDaysWithMinHours(sessions, 5);
  if (consecutiveDays5h >= 7) unlock('streak_7d_5h');

  // ---- Lifetime achievements ----
  if (totalHours >= 1) unlock('lifetime_1h');
  if (totalHours >= 10) unlock('lifetime_10h');
  if (totalHours >= 25) unlock('lifetime_25h');
  if (totalHours >= 50) unlock('lifetime_50h');
  if (totalHours >= 100) unlock('lifetime_100h');
  if (totalHours >= 250) unlock('lifetime_250h');
  if (totalHours >= 500) unlock('lifetime_500h');
  if (totalHours >= 1000) unlock('lifetime_1000h');

  // ---- Session count achievements ----
  if (sessionCount >= 10) unlock('sessions_10');
  if (sessionCount >= 50) unlock('sessions_50');
  if (sessionCount >= 100) unlock('sessions_100');
  if (sessionCount >= 500) unlock('sessions_500');

  return newlyUnlocked;
}

export function getAchievementDef(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: string): AchievementDef[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export const RARITY_COLORS: Record<string, string> = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-green-400 to-emerald-500',
  rare: 'from-blue-400 to-indigo-500',
  epic: 'from-purple-400 to-violet-500',
  legendary: 'from-amber-400 to-orange-500',
};

export const RARITY_BORDER_COLORS: Record<string, string> = {
  common: 'border-slate-500/30',
  uncommon: 'border-emerald-500/30',
  rare: 'border-indigo-500/30',
  epic: 'border-violet-500/30',
  legendary: 'border-amber-500/30',
};

export const RARITY_GLOW: Record<string, string> = {
  common: '',
  uncommon: 'shadow-emerald-500/20',
  rare: 'shadow-indigo-500/20',
  epic: 'shadow-violet-500/30',
  legendary: 'shadow-amber-500/40',
};
