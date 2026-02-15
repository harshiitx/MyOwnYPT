'use client';

// ==========================================
// Study Heatmap — GitHub-style Contribution Grid
// Responsive, mobile-friendly, timezone-safe
// ==========================================

import { useMemo, useRef, useEffect } from 'react';
import { StudySession } from '@/lib/types';
import { getStudyDate, formatDuration } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Grid3X3 } from 'lucide-react';

interface HeatmapProps {
  sessions: StudySession[];
}

interface DayCell {
  date: string;       // YYYY-MM-DD
  totalSeconds: number;
  intensity: number;
  isToday: boolean;
  tooltipLabel: string;
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
  'bg-surface-light/30',   // 0: no activity
  'bg-primary/20',          // 1: light
  'bg-primary/40',          // 2: moderate
  'bg-primary/60',          // 3: good
  'bg-primary/80',          // 4: great
  'bg-primary',             // 5: intense
];

const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TOTAL_WEEKS = 16;

// Pure date helpers (no date-fns — avoids timezone parsing issues)
function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTooltip(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function Heatmap({ sessions }: HeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { weeks, monthLabels } = useMemo(() => {
    const todayStr = getStudyDate();
    const [ty, tm, td] = todayStr.split('-').map(Number);
    // Use noon to avoid any DST / timezone boundary issues
    const todayDate = new Date(ty, tm - 1, td, 12, 0, 0);
    const todayDOW = todayDate.getDay(); // 0=Sun ... 6=Sat

    // Build daily totals map from completed sessions
    const dailyTotals = new Map<string, number>();
    for (const session of sessions) {
      if (session.endTime === null) continue;
      const current = dailyTotals.get(session.date) || 0;
      dailyTotals.set(session.date, current + session.duration);
    }

    // Grid: (TOTAL_WEEKS - 1) complete weeks + partial last week ending on today
    // This ensures the first cell is a Sunday and the last cell is today
    const totalCells = (TOTAL_WEEKS - 1) * 7 + todayDOW + 1;

    const cells: DayCell[] = [];
    for (let i = totalCells - 1; i >= 0; i--) {
      const d = new Date(todayDate.getTime());
      d.setDate(d.getDate() - i);
      const dateStr = toDateStr(d);
      const totalSeconds = dailyTotals.get(dateStr) || 0;

      cells.push({
        date: dateStr,
        totalSeconds,
        intensity: getIntensity(totalSeconds),
        isToday: dateStr === todayStr,
        tooltipLabel: `${toTooltip(d)}: ${totalSeconds > 0 ? formatDuration(totalSeconds) : 'No study'}`,
      });
    }

    // Group into weeks (columns of 7 days each)
    const weeks: DayCell[][] = [];
    let currentWeek: DayCell[] = [];
    for (const cell of cells) {
      currentWeek.push(cell);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    // Month labels: detect month transitions from each week's first day
    const monthLabels: { weekIndex: number; label: string }[] = [];
    let prevMonth = -1;
    for (let w = 0; w < weeks.length; w++) {
      const firstDay = weeks[w][0];
      const month = +firstDay.date.split('-')[1] - 1; // 0-indexed
      if (month !== prevMonth) {
        monthLabels.push({ weekIndex: w, label: MONTH_NAMES[month] });
        prevMonth = month;
      }
    }

    return { weeks, monthLabels };
  }, [sessions]);

  // Auto-scroll to show the most recent data (right side)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [weeks]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/5"
    >
      <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-3 sm:mb-4">
        <Grid3X3 size={18} />
        Study Heatmap
      </h2>

      {/* Scrollable grid container */}
      <div ref={scrollRef} className="overflow-x-auto scrollbar-none">
        <div className="inline-flex gap-[2px] sm:gap-[3px]">
          {/* Day labels column (sticky on left) */}
          <div className="flex flex-col gap-[2px] sm:gap-[3px] pr-1 sm:pr-1.5 shrink-0">
            {/* Spacer for month label row */}
            <div className="h-3 sm:h-4" />
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                className="h-[10px] sm:h-[13px] flex items-center justify-end"
              >
                <span className="text-[7px] sm:text-[9px] text-text-secondary/60 leading-none">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => {
            const monthLabel = monthLabels.find(m => m.weekIndex === wi);
            return (
              <div key={wi} className="flex flex-col gap-[2px] sm:gap-[3px]">
                {/* Month label row — aligned with its column */}
                <div className="h-3 sm:h-4 flex items-end overflow-visible">
                  {monthLabel && (
                    <span className="text-[7px] sm:text-[10px] text-text-secondary leading-none whitespace-nowrap">
                      {monthLabel.label}
                    </span>
                  )}
                </div>

                {/* Day cells */}
                {week.map((day) => (
                  <div
                    key={day.date}
                    className={`
                      w-[10px] h-[10px] sm:w-[13px] sm:h-[13px] rounded-[2px] sm:rounded-[3px]
                      transition-colors duration-200 cursor-default
                      ${INTENSITY_CLASSES[day.intensity]}
                      ${day.isToday
                        ? 'ring-1.5 ring-primary ring-offset-1 ring-offset-surface'
                        : 'hover:ring-1 hover:ring-primary/40'
                      }
                    `}
                    title={day.tooltipLabel}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend + Today indicator */}
      <div className="flex items-center justify-between mt-2 sm:mt-3">
        <div className="flex items-center gap-1">
          <div className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-[2px] bg-surface-light/30 ring-1 ring-primary ring-offset-1 ring-offset-surface" />
          <span className="text-[8px] sm:text-[10px] text-text-secondary">Today</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] sm:text-[10px] text-text-secondary mr-0.5">Less</span>
          {INTENSITY_CLASSES.map((cls, i) => (
            <div key={i} className={`w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-[2px] ${cls}`} />
          ))}
          <span className="text-[8px] sm:text-[10px] text-text-secondary ml-0.5">More</span>
        </div>
      </div>
    </motion.div>
  );
}
