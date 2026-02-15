'use client';

// ==========================================
// Zustand Store - Global State Management
// ==========================================

import { create } from 'zustand';
import { StudySession, UnlockedAchievement, AppSettings } from '@/lib/types';
import { UserSubject } from '@/lib/subjects';
import {
  loadSessions,
  saveSessions,
  loadAchievements,
  saveAchievements,
  loadSettings,
  saveSettings,
  loadSubjects,
  saveSubjects,
  saveTimerState,
  clearTimerState,
  loadTimerState,
} from '@/lib/storage';
import { generateId, getStudyDate } from '@/lib/utils';
import { checkAchievements } from '@/lib/achievements';

interface StoreState {
  // Timer state
  isRunning: boolean;
  currentSessionStart: number | null;
  elapsedBeforePause: number;
  currentSubject: string | null;

  // Data
  sessions: StudySession[];
  unlockedAchievements: UnlockedAchievement[];
  settings: AppSettings;
  subjects: UserSubject[];

  // UI
  activeTab: 'timer' | 'dashboard' | 'achievements' | 'settings';
  newAchievements: string[];
  hydrated: boolean;

  // Actions
  hydrate: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  setActiveTab: (tab: StoreState['activeTab']) => void;
  dismissAchievement: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setCurrentSubject: (subject: string | null) => void;
  addSubject: (subject: UserSubject) => void;
  removeSubject: (id: string) => void;
  importData: (sessions: StudySession[], achievements: UnlockedAchievement[], settings: AppSettings) => void;
  clearAllData: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Initial state
  isRunning: false,
  currentSessionStart: null,
  elapsedBeforePause: 0,
  currentSubject: null,
  sessions: [],
  unlockedAchievements: [],
  settings: {
    theme: 'midnight',
    wallpaper: 'default',
    dailyGoalHours: 5,
    soundEnabled: true,
  },
  subjects: [],
  activeTab: 'timer',
  newAchievements: [],
  hydrated: false,

  // Hydrate from localStorage
  hydrate: () => {
    const sessions = loadSessions();
    const achievements = loadAchievements();
    const settings = loadSettings();
    const subjects = loadSubjects();
    const timerState = loadTimerState();

    let isRunning = false;
    let currentSessionStart: number | null = null;
    let elapsedBeforePause = 0;
    let currentSubject: string | null = null;

    // Recover timer state if it was running
    if (timerState) {
      currentSubject = timerState.subject || null;
      if (timerState.isRunning && timerState.sessionStartTime) {
        isRunning = true;
        currentSessionStart = timerState.sessionStartTime;
        elapsedBeforePause = timerState.elapsedBeforePause;
      } else if (!timerState.isRunning && timerState.elapsedBeforePause > 0) {
        elapsedBeforePause = timerState.elapsedBeforePause;
      }
    }

    set({
      sessions,
      unlockedAchievements: achievements,
      settings,
      subjects,
      isRunning,
      currentSessionStart,
      elapsedBeforePause,
      currentSubject,
      hydrated: true,
    });
  },

  // Timer actions
  startTimer: () => {
    const now = Date.now();
    set({ isRunning: true, currentSessionStart: now });

    const state = get();
    saveTimerState({
      isRunning: true,
      sessionStartTime: now,
      elapsedBeforePause: state.elapsedBeforePause,
      subject: state.currentSubject,
    });
  },

  pauseTimer: () => {
    const state = get();
    if (!state.currentSessionStart) return;

    const runningDuration = (Date.now() - state.currentSessionStart) / 1000;
    const totalElapsed = state.elapsedBeforePause + runningDuration;

    set({
      isRunning: false,
      currentSessionStart: null,
      elapsedBeforePause: totalElapsed,
    });

    saveTimerState({
      isRunning: false,
      sessionStartTime: null,
      elapsedBeforePause: totalElapsed,
      subject: state.currentSubject,
    });
  },

  stopTimer: () => {
    const state = get();

    let totalDuration = state.elapsedBeforePause;
    if (state.isRunning && state.currentSessionStart) {
      totalDuration += (Date.now() - state.currentSessionStart) / 1000;
    }

    if (totalDuration >= 10) {
      const sessionStartTime = Date.now() - totalDuration * 1000;
      const newSession: StudySession = {
        id: generateId(),
        startTime: sessionStartTime,
        endTime: Date.now(),
        duration: Math.floor(totalDuration),
        date: getStudyDate(sessionStartTime),
        ...(state.currentSubject ? { subject: state.currentSubject } : {}),
      };

      const updatedSessions = [...state.sessions, newSession];
      saveSessions(updatedSessions);

      const newAchievementIds = checkAchievements(
        updatedSessions,
        state.unlockedAchievements,
        Math.floor(totalDuration)
      );

      let updatedAchievements = state.unlockedAchievements;
      if (newAchievementIds.length > 0) {
        const newUnlocked: UnlockedAchievement[] = newAchievementIds.map(id => ({
          id,
          unlockedAt: Date.now(),
        }));
        updatedAchievements = [...state.unlockedAchievements, ...newUnlocked];
        saveAchievements(updatedAchievements);
      }

      set({
        isRunning: false,
        currentSessionStart: null,
        elapsedBeforePause: 0,
        currentSubject: null,
        sessions: updatedSessions,
        unlockedAchievements: updatedAchievements,
        newAchievements: [...state.newAchievements, ...newAchievementIds],
      });
    } else {
      set({
        isRunning: false,
        currentSessionStart: null,
        elapsedBeforePause: 0,
        currentSubject: null,
      });
    }

    clearTimerState();
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  dismissAchievement: (id) => {
    set(state => ({
      newAchievements: state.newAchievements.filter(a => a !== id),
    }));
  },

  updateSettings: (newSettings) => {
    set(state => {
      const updated = { ...state.settings, ...newSettings };
      saveSettings(updated);
      return { settings: updated };
    });
  },

  setCurrentSubject: (subject) => {
    set({ currentSubject: subject });
    const state = get();
    if (state.isRunning || state.elapsedBeforePause > 0) {
      saveTimerState({
        isRunning: state.isRunning,
        sessionStartTime: state.currentSessionStart,
        elapsedBeforePause: state.elapsedBeforePause,
        subject,
      });
    }
  },

  addSubject: (subject) => {
    set(state => {
      const updated = [...state.subjects, subject];
      saveSubjects(updated);
      return { subjects: updated };
    });
  },

  removeSubject: (id) => {
    set(state => {
      const updated = state.subjects.filter(s => s.id !== id);
      saveSubjects(updated);
      // If the removed subject was currently selected, deselect it
      const newCurrentSubject = state.currentSubject === id ? null : state.currentSubject;
      return { subjects: updated, currentSubject: newCurrentSubject };
    });
  },

  importData: (sessions, achievements, settings) => {
    saveSessions(sessions);
    saveAchievements(achievements);
    saveSettings(settings);
    set({ sessions, unlockedAchievements: achievements, settings });
  },

  clearAllData: () => {
    saveSessions([]);
    saveAchievements([]);
    clearTimerState();
    set({
      sessions: [],
      unlockedAchievements: [],
      isRunning: false,
      currentSessionStart: null,
      elapsedBeforePause: 0,
      currentSubject: null,
      newAchievements: [],
    });
  },
}));
