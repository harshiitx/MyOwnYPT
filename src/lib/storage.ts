// ==========================================
// localStorage Persistence Layer
// ==========================================
// localStorage is a persistent browser storage that:
// ✅ Survives browser close/open
// ✅ Survives page refresh
// ✅ Survives login/logout
// ✅ Works across tabs (same origin)
// ❌ Does NOT sync across devices
// ❌ Can be cleared by "Clear browsing data"
//
// For a personal study timer, this is the simplest free option.
// Data size: ~1KB per 100 sessions (years of data in < 1MB)
// ==========================================

import { StudySession, UnlockedAchievement, AppSettings } from './types';

const STORAGE_KEYS = {
  SESSIONS: 'ypt_sessions',
  ACHIEVEMENTS: 'ypt_achievements',
  SETTINGS: 'ypt_settings',
  TIMER_STATE: 'ypt_timer_state',
} as const;

// ---- Sessions ----

export function loadSessions(): StudySession[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: StudySession[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions:', e);
  }
}

// ---- Achievements ----

export function loadAchievements(): UnlockedAchievement[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveAchievements(achievements: UnlockedAchievement[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  } catch (e) {
    console.error('Failed to save achievements:', e);
  }
}

// ---- Settings ----

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'midnight',
  wallpaper: 'default',
  dailyGoalHours: 5,
  soundEnabled: true,
};

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

// ---- Timer State (for recovery after refresh) ----

export interface PersistedTimerState {
  isRunning: boolean;
  sessionStartTime: number | null;
  elapsedBeforePause: number;
}

export function loadTimerState(): PersistedTimerState | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveTimerState(state: PersistedTimerState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save timer state:', e);
  }
}

export function clearTimerState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
}

// ---- Data Export/Import ----

export function exportAllData(): string {
  const data = {
    sessions: loadSessions(),
    achievements: loadAchievements(),
    settings: loadSettings(),
    exportedAt: new Date().toISOString(),
    version: 1,
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data.sessions || !data.version) {
      throw new Error('Invalid data format');
    }
    saveSessions(data.sessions);
    if (data.achievements) saveAchievements(data.achievements);
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
}
