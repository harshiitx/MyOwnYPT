// ==========================================
// Study Timer App - Type Definitions
// ==========================================

export interface StudySession {
  id: string;
  startTime: number;       // Unix timestamp (ms)
  endTime: number | null;  // null if session is ongoing
  duration: number;         // Duration in seconds
  date: string;            // YYYY-MM-DD (based on 5 AM cutoff)
}

export interface DailySummary {
  date: string;            // YYYY-MM-DD
  totalSeconds: number;
  sessionCount: number;
  longestSessionSeconds: number;
}

export type AchievementCategory = 'focus' | 'daily' | 'streak' | 'lifetime';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface UnlockedAchievement {
  id: string;
  unlockedAt: number; // Unix timestamp
}

export type ThemeId = 'midnight' | 'forest' | 'sunset' | 'ocean' | 'cherry' | 'lavender';

export type WallpaperId = 'default' | 'aurora' | 'nebula' | 'grid' | 'gradient-flow' | 'bokeh';

export interface AppSettings {
  theme: ThemeId;
  wallpaper: WallpaperId;
  dailyGoalHours: number;
  soundEnabled: boolean;
}

export interface AppState {
  // Timer
  isRunning: boolean;
  currentSessionStart: number | null; // Unix timestamp when current session started
  elapsedBeforePause: number;         // Seconds accumulated before current running period

  // Data
  sessions: StudySession[];
  unlockedAchievements: UnlockedAchievement[];
  settings: AppSettings;

  // UI
  activeTab: 'timer' | 'dashboard' | 'achievements' | 'settings';
  newAchievements: string[]; // Queue of achievement IDs to show as toasts
}

export interface DayStreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalDaysStudied: number;
  totalHoursAllTime: number;
}
