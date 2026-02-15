// ==========================================
// Utility Functions
// ==========================================

import { format, subDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { StudySession, DailySummary, DayStreakInfo } from './types';

// The "study day" starts at 5 AM
const DAY_START_HOUR = 5;

/**
 * Get the "study date" for a given timestamp.
 * If it's before 5 AM, it counts as the previous day.
 */
export function getStudyDate(timestamp: number = Date.now()): string {
  const date = new Date(timestamp);
  // If hour is before 5 AM, count as previous day
  if (date.getHours() < DAY_START_HOUR) {
    date.setDate(date.getDate() - 1);
  }
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get the start of the "study day" (5 AM) for a given date string
 */
export function getStudyDayStart(dateStr: string): Date {
  const date = parseISO(dateStr);
  date.setHours(DAY_START_HOUR, 0, 0, 0);
  return date;
}

/**
 * Get the end of the "study day" (next day 5 AM) for a given date string
 */
export function getStudyDayEnd(dateStr: string): Date {
  const date = parseISO(dateStr);
  date.setDate(date.getDate() + 1);
  date.setHours(DAY_START_HOUR, 0, 0, 0);
  return date;
}

/**
 * Format seconds into HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format seconds into a human-readable string
 */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours === 0 && minutes === 0) return 'Less than a minute';
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get daily summary for a specific date
 */
export function getDailySummary(sessions: StudySession[], dateStr: string): DailySummary {
  const daySessions = sessions.filter(s => s.date === dateStr && s.endTime !== null);
  const totalSeconds = daySessions.reduce((sum, s) => sum + s.duration, 0);
  const longestSession = daySessions.reduce((max, s) => Math.max(max, s.duration), 0);

  return {
    date: dateStr,
    totalSeconds,
    sessionCount: daySessions.length,
    longestSessionSeconds: longestSession,
  };
}

/**
 * Get daily summaries for the last N days
 */
export function getWeeklySummaries(sessions: StudySession[], days: number = 7): DailySummary[] {
  const today = getStudyDate();
  const summaries: DailySummary[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(parseISO(today), i), 'yyyy-MM-dd');
    summaries.push(getDailySummary(sessions, date));
  }

  return summaries;
}

/**
 * Calculate streak information
 */
export function getStreakInfo(sessions: StudySession[], minimumDailyHours: number = 1): DayStreakInfo {
  const today = getStudyDate();

  // Get all unique study dates and their totals
  const dailyTotals = new Map<string, number>();
  for (const session of sessions) {
    if (session.endTime === null) continue;
    const current = dailyTotals.get(session.date) || 0;
    dailyTotals.set(session.date, current + session.duration);
  }

  // Get dates that meet the minimum requirement (sorted newest first)
  const qualifyingDates = Array.from(dailyTotals.entries())
    .filter(([, seconds]) => seconds >= minimumDailyHours * 3600)
    .map(([date]) => date)
    .sort((a, b) => b.localeCompare(a));

  // Calculate current streak (must include today or yesterday)
  let currentStreak = 0;
  let checkDate = today;

  // Check if today qualifies
  const todayTotal = dailyTotals.get(today) || 0;
  if (todayTotal < minimumDailyHours * 3600) {
    // Check if yesterday qualifies (streak might still be active)
    const yesterday = format(subDays(parseISO(today), 1), 'yyyy-MM-dd');
    checkDate = yesterday;
  }

  // Count consecutive days backwards
  let tempDate = checkDate;
  while (qualifyingDates.includes(tempDate)) {
    currentStreak++;
    tempDate = format(subDays(parseISO(tempDate), 1), 'yyyy-MM-dd');
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;

  const allDates = Array.from(dailyTotals.entries())
    .filter(([, seconds]) => seconds >= minimumDailyHours * 3600)
    .map(([date]) => date)
    .sort();

  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const daysDiff = differenceInCalendarDays(
        parseISO(allDates[i]),
        parseISO(allDates[i - 1])
      );
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Total stats
  const totalDaysStudied = dailyTotals.size;
  const totalSeconds = Array.from(dailyTotals.values()).reduce((sum, s) => sum + s, 0);
  const totalHoursAllTime = totalSeconds / 3600;

  return {
    currentStreak: Math.max(currentStreak, 0),
    longestStreak: Math.max(longestStreak, currentStreak),
    totalDaysStudied,
    totalHoursAllTime,
  };
}

/**
 * Get consecutive days meeting a specific daily hours target (for achievement checking)
 */
export function getConsecutiveDaysWithMinHours(
  sessions: StudySession[],
  minHoursPerDay: number,
  upToDate?: string
): number {
  const targetDate = upToDate || getStudyDate();

  const dailyTotals = new Map<string, number>();
  for (const session of sessions) {
    if (session.endTime === null) continue;
    const current = dailyTotals.get(session.date) || 0;
    dailyTotals.set(session.date, current + session.duration);
  }

  let count = 0;
  let checkDate = targetDate;

  while (true) {
    const total = dailyTotals.get(checkDate) || 0;
    if (total >= minHoursPerDay * 3600) {
      count++;
      checkDate = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd');
    } else {
      break;
    }
  }

  return count;
}

/**
 * Get the day name abbreviation for a date
 */
export function getDayAbbrev(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE');
}

/**
 * Get formatted date
 */
export function getFormattedDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}
