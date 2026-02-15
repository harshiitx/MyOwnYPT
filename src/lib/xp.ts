// ==========================================
// XP & Level System
// ==========================================

import { StudySession } from './types';

export interface LevelInfo {
  level: number;
  title: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
  totalXP: number;
}

interface LevelThreshold {
  level: number;
  xp: number;
  title: string;
  emoji: string;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  { level: 1, xp: 0, title: 'Noob', emoji: '🥚' },
  { level: 2, xp: 60, title: 'Beginner', emoji: '🌱' },
  { level: 3, xp: 180, title: 'Novice', emoji: '📗' },
  { level: 4, xp: 360, title: 'Apprentice', emoji: '📘' },
  { level: 5, xp: 600, title: 'Student', emoji: '🎒' },
  { level: 6, xp: 1200, title: 'Dedicated', emoji: '📚' },
  { level: 7, xp: 1800, title: 'Scholar', emoji: '🎓' },
  { level: 8, xp: 3000, title: 'Expert', emoji: '🧠' },
  { level: 9, xp: 6000, title: 'Master', emoji: '⚔️' },
  { level: 10, xp: 12000, title: 'Grandmaster', emoji: '👑' },
  { level: 11, xp: 18000, title: 'Legend', emoji: '🏛️' },
  { level: 12, xp: 30000, title: 'Mythic', emoji: '🌟' },
  { level: 13, xp: 60000, title: 'Immortal', emoji: '💎' },
];

/**
 * Calculate total XP from sessions.
 * 1 XP per minute of study time.
 */
export function calculateTotalXP(sessions: StudySession[]): number {
  const totalSeconds = sessions
    .filter(s => s.endTime !== null)
    .reduce((sum, s) => sum + s.duration, 0);
  return Math.floor(totalSeconds / 60);
}

/**
 * Get detailed level information for a given total XP.
 */
export function getLevelInfo(totalXP: number): LevelInfo {
  let currentLevel = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1] || null;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i].xp) {
      currentLevel = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || null;
      break;
    }
  }

  const xpForCurrentLevel = currentLevel.xp;
  const xpForNextLevel = nextLevel ? nextLevel.xp : currentLevel.xp;
  const xpInLevel = totalXP - xpForCurrentLevel;
  const xpNeededForLevel = nextLevel ? xpForNextLevel - xpForCurrentLevel : 1;
  const progressPercent = nextLevel
    ? Math.min((xpInLevel / xpNeededForLevel) * 100, 100)
    : 100;

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    currentXP: xpInLevel,
    xpForCurrentLevel,
    xpForNextLevel,
    progressPercent,
    totalXP,
  };
}

/**
 * Get emoji for the current level.
 */
export function getLevelEmoji(level: number): string {
  const threshold = LEVEL_THRESHOLDS.find(t => t.level === level);
  return threshold?.emoji || '🥚';
}
