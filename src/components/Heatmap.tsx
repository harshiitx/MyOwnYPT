'use client';

// ==========================================
// Study Heatmap — GitHub-style Contribution Grid
// ==========================================

import { useMemo } from 'react';
import { StudySession } from '@/lib/types';
import { getStudyDate, getDailySummary, formatDuration } from '@/lib/utils';
import { format, subDays, parseISO, startOfWeek, differenceInCalendarWeeks } from 'date-fns';
import { motion } from 'framer-motion';
import { Grid3X3 } from 'lucide-react';

interface HeatmapProps {
  sessions: StudySession[];
}

function getIntensity(totalSeconds: number): number {
  if (totalSeconds === 0) return 0;
  if (totalSeconds < 1800) return 1;   // < 30 min
  if (totalSeconds < 3600) return 2;   // < 1 hour
  if (totalSeconds < 7200) return 3;   // < 2 hours
  if (totalSeconds < 14400) return 4;  // < 4 hours
  return 5;                            // 4+ hours
}

const INTENSITY_CLASSES = [
  'bg-surface-light/30',                           // 0: no activity
  'bg-primary/20',                                  // 1: light
  'bg-primary/40',                                  // 2: moderate
  'bg-primary/60',                                  // 3: good
  'bg-primary/80',                                  // 4: great
  'bg-primary',                                     // 5: intense
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function Heatmap({ sessions }: HeatmapProps) {
  const { weeks, monthLabels } = useMemo(() => {
    const today = getStudyDate();
    const todayDate = parseISO(today);
    const TOTAL_WEEKS = 13; // ~3 months

    // Build daily totals map
    const dailyTotals = new Map<string, number>();
    for (const session of sessions) {
      if (session.endTime === null) continue;
      const current = dailyTotals.get(session.date) || 0;
      dailyTotals.set(session.date, current + session.duration);
    }

    // Generate grid data — 13 weeks × 7 days
    const weeks: { date: string; totalSeconds: number; intensity: number }[][] = [];
    const startDate = subDays(todayDate, TOTAL_WEEKS * 7 - 1);

    // Align to start of week (Sunday)
    const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });
    const totalDays = differenceInCalendarWeeks(todayDate, weekStart, { weekStartsOn: 0 }) * 7 + todayDate.getDay() + 1;

    let currentWeek: { date: string; totalSeconds: number; intensity: number }[] = [];

    for (let i = 0; i < Math.max(totalDays, TOTAL_WEEKS * 7); i++) {
      const date = format(subDays(todayDate, Math.max(totalDays, TOTAL_WEEKS * 7) - 1 - i), 'yyyy-MM-dd');
      const totalSeconds = dailyTotals.get(date) || 0;
      currentWeek.push({
        date,
        totalSeconds,
        intensity: getIntensity(totalSeconds),
      });
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Generate month labels
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = '';
    for (let w = 0; w < weeks.length; w++) {
      // Use the first day of each week to determine the month
      const firstDay = weeks[w][0];
      if (firstDay) {
        const month = format(parseISO(firstDay.date), 'MMM');
        if (month !== lastMonth) {
          monthLabels.push({ label: month, weekIndex: w });
          lastMonth = month;
        }
      }
    }

    return { weeks, monthLabels };
  }, [sessions]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5"
    >
      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
        <Grid3X3 size={18} />
        Study Heatmap
      </h2>

      {/* Month labels */}
      <div className="flex ml-8 mb-1">
        {monthLabels.map((m, i) => (
          <span
            key={`${m.label}-${i}`}
            className="text-[10px] text-text-secondary"
            style={{
              position: 'relative',
              left: `${m.weekIndex * (14 + 3)}px`,
              marginRight: i < monthLabels.length - 1
                ? `${((monthLabels[i + 1]?.weekIndex || 0) - m.weekIndex) * (14 + 3) - 30}px`
                : 0,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div className="flex gap-0.5">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 mr-1.5">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="h-[14px] flex items-center justify-end">
              <span className="text-[9px] text-text-secondary/60 leading-none">{label}</span>
            </div>
          ))}
        </div>

        {/* Weeks */}
        <div className="flex gap-0.5 overflow-x-auto scrollbar-none">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map((day, di) => (
                <div
                  key={day.date}
                  className={`w-[14px] h-[14px] rounded-[3px] ${INTENSITY_CLASSES[day.intensity]} 
                    transition-colors duration-200 hover:ring-1 hover:ring-primary/50 cursor-default`}
                  title={`${format(parseISO(day.date), 'MMM d, yyyy')}: ${day.totalSeconds > 0 ? formatDuration(day.totalSeconds) : 'No study'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-[10px] text-text-secondary mr-1">Less</span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div key={i} className={`w-[12px] h-[12px] rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-text-secondary ml-1">More</span>
      </div>
    </motion.div>
  );
}
