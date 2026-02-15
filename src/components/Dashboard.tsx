'use client';

import { useStore } from '@/store/useStore';
import {
  getStudyDate,
  getDailySummary,
  getWeeklySummaries,
  getStreakInfo,
  formatDuration,
  getDayAbbrev,
  getFormattedDate,
} from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Calendar, Clock, Award, Zap, Target, BookOpen } from 'lucide-react';

export default function Dashboard() {
  const { sessions, settings } = useStore();
  const today = getStudyDate();
  const todaySummary = getDailySummary(sessions, today);
  const weeklySummaries = getWeeklySummaries(sessions, 7);
  const streakInfo = getStreakInfo(sessions, 1);

  // Find max for chart scaling
  const maxDailySeconds = Math.max(
    ...weeklySummaries.map(d => d.totalSeconds),
    settings.dailyGoalHours * 3600
  );

  const completedSessions = sessions.filter(s => s.endTime !== null);
  const longestSession = completedSessions.reduce((max, s) => Math.max(max, s.duration), 0);

  // Recent sessions (last 5)
  const recentSessions = [...completedSessions]
    .sort((a, b) => b.startTime - a.startTime)
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="px-4 py-6 pb-24 max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.h1 variants={itemVariants} className="text-2xl font-bold text-text-primary mb-1">
        Dashboard
      </motion.h1>
      <motion.p variants={itemVariants} className="text-text-secondary text-sm mb-6">
        {format(new Date(), 'EEEE, MMMM d')} • Day starts at 5:00 AM
      </motion.p>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={<Clock size={20} className="text-primary" />}
          label="Today"
          value={formatDuration(todaySummary.totalSeconds)}
          sub={`${todaySummary.sessionCount} sessions`}
        />
        <StatCard
          icon={<Flame size={20} className="text-orange-400" />}
          label="Current Streak"
          value={`${streakInfo.currentStreak} days`}
          sub={`Best: ${streakInfo.longestStreak} days`}
        />
        <StatCard
          icon={<TrendingUp size={20} className="text-emerald-400" />}
          label="Total Hours"
          value={`${streakInfo.totalHoursAllTime.toFixed(1)}h`}
          sub={`${streakInfo.totalDaysStudied} days studied`}
        />
        <StatCard
          icon={<Zap size={20} className="text-amber-400" />}
          label="Longest Session"
          value={formatDuration(longestSession)}
          sub="Personal best"
        />
      </motion.div>

      {/* Weekly Chart */}
      <motion.div
        variants={itemVariants}
        className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Calendar size={18} />
            This Week
          </h2>
          <span className="text-xs text-text-secondary">
            Goal: {settings.dailyGoalHours}h/day
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-40">
          {weeklySummaries.map((day, i) => {
            const heightPercent = maxDailySeconds > 0
              ? (day.totalSeconds / maxDailySeconds) * 100
              : 0;
            const goalMet = day.totalSeconds >= settings.dailyGoalHours * 3600;
            const isToday = day.date === today;

            return (
              <div key={day.date} className="flex flex-col items-center flex-1 h-full justify-end">
                {/* Hours label */}
                <span className="text-[10px] text-text-secondary mb-1">
                  {day.totalSeconds > 0 ? formatDuration(day.totalSeconds) : ''}
                </span>

                {/* Bar */}
                <motion.div
                  className={`w-full max-w-[40px] rounded-t-lg relative overflow-hidden ${
                    goalMet
                      ? 'bg-gradient-to-t from-primary to-primary/60'
                      : 'bg-surface-light'
                  } ${isToday ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-surface' : ''}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPercent, 2)}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5, ease: 'easeOut' }}
                />

                {/* Goal line indicator */}
                {goalMet && (
                  <span className="text-[10px] mt-0.5">✅</span>
                )}

                {/* Day label */}
                <span className={`text-xs mt-1.5 ${isToday ? 'text-primary font-bold' : 'text-text-secondary'}`}>
                  {getDayAbbrev(day.date)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Goal line */}
        <div className="relative mt-2">
          <div
            className="absolute border-t border-dashed border-primary/30 w-full"
            style={{
              bottom: `${(settings.dailyGoalHours * 3600 / maxDailySeconds) * 100}%`,
            }}
          />
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div
        variants={itemVariants}
        className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5"
      >
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
          <BookOpen size={18} />
          Recent Sessions
        </h2>

        {recentSessions.length === 0 ? (
          <p className="text-text-secondary text-sm text-center py-8">
            No sessions yet. Start studying to see your history! 📚
          </p>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between bg-surface/50 rounded-xl px-4 py-3 border border-white/5"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {format(new Date(session.startTime), 'h:mm a')} — {format(new Date(session.endTime!), 'h:mm a')}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {getFormattedDate(session.date)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatDuration(session.duration)}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-text-secondary uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-0.5">{sub}</p>
    </div>
  );
}
