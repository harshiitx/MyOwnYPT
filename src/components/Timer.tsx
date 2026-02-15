'use client';

import { useStore } from '@/store/useStore';
import { useTimer } from '@/hooks/useTimer';
import { formatTime, getDailySummary, getStudyDate, formatDuration } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock, Flame } from 'lucide-react';

export default function Timer() {
  const { isRunning, startTimer, pauseTimer, stopTimer, sessions, settings, elapsedBeforePause } = useStore();
  const elapsed = useTimer();

  const today = getStudyDate();
  const todaySummary = getDailySummary(sessions, today);
  const todayHours = todaySummary.totalSeconds / 3600;
  const goalProgress = Math.min((todayHours / settings.dailyGoalHours) * 100, 100);
  const isPaused = !isRunning && elapsedBeforePause > 0;

  // Calculate circle progress
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (goalProgress / 100) * circumference;

  // Timer ring progress (session progress, resets every hour)
  const sessionMinutes = (elapsed % 3600) / 3600;
  const timerOffset = circumference - sessionMinutes * circumference;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 pb-4">
      {/* Motivational text */}
      <motion.p
        className="text-text-secondary text-sm mb-6 tracking-wide uppercase"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {isRunning ? 'Stay focused, you got this! 🔥' : isPaused ? 'Paused — Ready to continue?' : 'Ready to study?'}
      </motion.p>

      {/* Timer Circle */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <svg width="320" height="320" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="rgb(var(--color-surface-light))"
            strokeWidth="6"
            fill="none"
          />
          {/* Daily goal progress */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="rgb(var(--color-primary) / 0.3)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Inner circle - session timer */}
          <circle
            cx="160"
            cy="160"
            r={radius - 14}
            stroke="rgb(var(--color-surface-light) / 0.5)"
            strokeWidth="4"
            fill="none"
          />
          {isRunning && (
            <circle
              cx="160"
              cy="160"
              r={radius - 14}
              stroke="rgb(var(--color-primary))"
              strokeWidth="4"
              fill="none"
              strokeDasharray={2 * Math.PI * (radius - 14)}
              strokeDashoffset={2 * Math.PI * (radius - 14) - sessionMinutes * 2 * Math.PI * (radius - 14)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          )}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-6xl font-mono font-bold text-text-primary tracking-wider"
            key={formatTime(elapsed)}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
          >
            {formatTime(elapsed)}
          </motion.span>
          {isRunning && (
            <motion.div
              className="flex items-center gap-1.5 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-text-secondary uppercase tracking-widest">Recording</span>
            </motion.div>
          )}
          {isPaused && (
            <motion.div
              className="flex items-center gap-1.5 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-amber-400 uppercase tracking-widest">Paused</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Control Buttons */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {!isRunning && !isPaused ? (
          <button
            onClick={startTimer}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-semibold text-lg
                       hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/30
                       hover:shadow-xl hover:shadow-primary/40 active:scale-95"
          >
            <Play size={22} fill="white" />
            Start Study
          </button>
        ) : (
          <>
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-surface-light text-text-primary font-semibold
                         hover:bg-surface-light/80 transition-all duration-200 active:scale-95 border border-white/5"
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button
              onClick={stopTimer}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-red-500/20 text-red-400 font-semibold
                         hover:bg-red-500/30 transition-all duration-200 active:scale-95 border border-red-500/20"
            >
              <Square size={18} fill="currentColor" />
              Stop
            </button>
          </>
        )}
      </motion.div>

      {/* Today's Stats */}
      <motion.div
        className="w-full max-w-md grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="bg-surface-light/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 text-center">
          <Clock size={18} className="mx-auto mb-1.5 text-text-secondary" />
          <p className="text-lg font-bold text-text-primary">{formatDuration(todaySummary.totalSeconds)}</p>
          <p className="text-xs text-text-secondary">Today</p>
        </div>
        <div className="bg-surface-light/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 text-center">
          <Flame size={18} className="mx-auto mb-1.5 text-orange-400" />
          <p className="text-lg font-bold text-text-primary">{todaySummary.sessionCount}</p>
          <p className="text-xs text-text-secondary">Sessions</p>
        </div>
        <div className="bg-surface-light/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 text-center">
          <div className="mx-auto mb-1.5 text-primary text-lg font-bold">
            {goalProgress >= 100 ? '✅' : `${Math.round(goalProgress)}%`}
          </div>
          <p className="text-lg font-bold text-text-primary">{settings.dailyGoalHours}h</p>
          <p className="text-xs text-text-secondary">Goal</p>
        </div>
      </motion.div>
    </div>
  );
}
