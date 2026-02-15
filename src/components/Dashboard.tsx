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
import { calculateTotalXP, getLevelInfo, getLevelEmoji, LEVEL_THRESHOLDS } from '@/lib/xp';
import { getSubjectFromList } from '@/lib/subjects';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Calendar, Clock, Zap, BookOpen, Star } from 'lucide-react';
import Heatmap from './Heatmap';
import ShareableCard from './ShareableCard';

export default function Dashboard() {
  const { sessions, settings, subjects } = useStore();
  const today = getStudyDate();
  const todaySummary = getDailySummary(sessions, today);
  const weeklySummaries = getWeeklySummaries(sessions, 7);
  const streakInfo = getStreakInfo(sessions, 1);

  // XP / Level
  const totalXP = calculateTotalXP(sessions);
  const levelInfo = getLevelInfo(totalXP);
  const nextLevel = LEVEL_THRESHOLDS.find(t => t.level === levelInfo.level + 1);

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

  // Subject breakdown
  const subjectTotals = new Map<string, number>();
  for (const session of completedSessions) {
    const key = session.subject || 'general';
    subjectTotals.set(key, (subjectTotals.get(key) || 0) + session.duration);
  }
  const sortedSubjects = Array.from(subjectTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxSubjectSeconds = sortedSubjects[0]?.[1] || 1;

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
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <ShareableCard />
      </motion.div>
      <motion.p variants={itemVariants} className="text-text-secondary text-sm mb-6">
        {format(new Date(), 'EEEE, MMMM d')} • Day starts at 5:00 AM
      </motion.p>

      {/* XP / Level Card */}
      <motion.div
        variants={itemVariants}
        className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5 mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface text-2xl">
              {getLevelEmoji(levelInfo.level)}
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">Level {levelInfo.level}</p>
              <p className="text-sm text-text-secondary">{levelInfo.title}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">{totalXP} XP</p>
            {nextLevel && (
              <p className="text-[10px] text-text-secondary">
                {nextLevel.xp - totalXP} XP to Lv.{nextLevel.level}
              </p>
            )}
          </div>
        </div>
        {/* XP Progress Bar */}
        <div className="w-full h-3 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            initial={{ width: 0 }}
            animate={{ width: `${levelInfo.progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-text-secondary">
            {levelInfo.xpForCurrentLevel} XP
          </span>
          <span className="text-[10px] text-text-secondary">
            {Math.round(levelInfo.progressPercent)}%
          </span>
          <span className="text-[10px] text-text-secondary">
            {levelInfo.xpForNextLevel} XP
          </span>
        </div>
      </motion.div>

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
                <span className="text-[10px] text-text-secondary mb-1">
                  {day.totalSeconds > 0 ? formatDuration(day.totalSeconds) : ''}
                </span>
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
                {goalMet && <span className="text-[10px] mt-0.5">✅</span>}
                <span className={`text-xs mt-1.5 ${isToday ? 'text-primary font-bold' : 'text-text-secondary'}`}>
                  {getDayAbbrev(day.date)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="relative mt-2">
          <div
            className="absolute border-t border-dashed border-primary/30 w-full"
            style={{
              bottom: `${(settings.dailyGoalHours * 3600 / maxDailySeconds) * 100}%`,
            }}
          />
        </div>
      </motion.div>

      {/* Study Heatmap */}
      <motion.div variants={itemVariants} className="mb-6">
        <Heatmap sessions={sessions} />
      </motion.div>

      {/* Subject Breakdown */}
      {sortedSubjects.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-5 border border-white/5 mb-6"
        >
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
            <Star size={18} />
            Subject Breakdown
          </h2>
          <div className="space-y-3">
            {sortedSubjects.map(([subjectId, totalSeconds]) => {
              const subject = getSubjectFromList(subjectId, subjects);
              const name = subject ? `${subject.emoji} ${subject.name}` : (subjectId === 'general' ? '📌 General' : `📌 ${subjectId}`);
              const percent = (totalSeconds / maxSubjectSeconds) * 100;

              return (
                <div key={subjectId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-text-primary">{name}</span>
                    <span className="text-xs text-text-secondary">{formatDuration(totalSeconds)}</span>
                  </div>
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

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
            {recentSessions.map((session) => {
              const subject = session.subject ? getSubjectFromList(session.subject, subjects) : null;
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between bg-surface/50 rounded-xl px-4 py-3 border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    {subject && (
                      <span className="text-lg" title={subject.name}>
                        {subject.emoji}
                      </span>
                    )}
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {format(new Date(session.startTime), 'h:mm a')} — {format(new Date(session.endTime!), 'h:mm a')}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {getFormattedDate(session.date)}
                        {subject && <span className="ml-1 text-text-secondary/80">• {subject.name}</span>}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {formatDuration(session.duration)}
                  </span>
                </div>
              );
            })}
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
