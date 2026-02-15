'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { useTimer } from '@/hooks/useTimer';
import { formatTime, getDailySummary, getStudyDate, formatDuration } from '@/lib/utils';
import { getDailyQuote } from '@/lib/quotes';
import { calculateTotalXP, getLevelInfo, getLevelEmoji } from '@/lib/xp';
import {
  getSubjectBgClass,
  validateSubjectName,
  createSubject,
  MAX_SUBJECTS,
} from '@/lib/subjects';
import { motion } from 'framer-motion';
import { Play, Pause, Square, Clock, Flame, Sparkles, Plus, X, Check } from 'lucide-react';
import Confetti from './Confetti';

export default function Timer() {
  const {
    isRunning, startTimer, pauseTimer, stopTimer,
    sessions, settings, elapsedBeforePause,
    currentSubject, setCurrentSubject,
    subjects, addSubject,
  } = useStore();
  const elapsed = useTimer();

  const today = getStudyDate();
  const todaySummary = getDailySummary(sessions, today);
  const todayTotalWithCurrent = todaySummary.totalSeconds + (isRunning || elapsedBeforePause > 0 ? elapsed : 0);
  const goalInSeconds = settings.dailyGoalHours * 3600;
  const goalProgress = Math.min((todayTotalWithCurrent / goalInSeconds) * 100, 100);
  const isPaused = !isRunning && elapsedBeforePause > 0;

  // XP / Level
  const totalXP = calculateTotalXP(sessions);
  const levelInfo = getLevelInfo(totalXP);

  // Daily quote
  const dailyQuote = getDailyQuote();

  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiShownRef = useRef(false);
  const prevGoalMetRef = useRef(todaySummary.totalSeconds >= goalInSeconds);

  // Inline add-subject state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  // Check if daily goal just got met during this session
  useEffect(() => {
    if (confettiShownRef.current) return;
    if (!isRunning && !isPaused) return;

    const previouslyMet = prevGoalMetRef.current;
    const currentlyMet = todayTotalWithCurrent >= goalInSeconds;

    if (!previouslyMet && currentlyMet) {
      confettiShownRef.current = true;
      setShowConfetti(true);
    }
  }, [todayTotalWithCurrent, goalInSeconds, isRunning, isPaused]);

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

  // Focus input when adding
  useEffect(() => {
    if (isAdding) addInputRef.current?.focus();
  }, [isAdding]);

  // Subject tag toggle
  const toggleSubject = (id: string) => {
    setCurrentSubject(currentSubject === id ? null : id);
  };

  // Add subject handler
  const handleAddSubject = () => {
    const result = validateSubjectName(newName, subjects);
    if (!result.valid) {
      setAddError(result.error || 'Invalid name');
      return;
    }
    const newSubject = createSubject(result.sanitized, subjects);
    addSubject(newSubject);
    setCurrentSubject(newSubject.id);
    setNewName('');
    setAddError(null);
    setIsAdding(false);
  };

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddSubject();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewName('');
      setAddError(null);
    }
  };

  // Calculate circle progress
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (goalProgress / 100) * circumference;

  // Timer ring progress (session progress, resets every hour)
  const sessionMinutes = (elapsed % 3600) / 3600;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-4 pb-4">
      {/* Confetti Overlay */}
      {showConfetti && <Confetti onComplete={handleConfettiComplete} />}

      {/* Daily Quote */}
      <motion.div
        className="max-w-md text-center mb-4 px-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <p className="text-text-secondary text-xs italic leading-relaxed">
          &ldquo;{dailyQuote.text}&rdquo;
          {dailyQuote.author && (
            <span className="text-text-secondary/60 ml-1">— {dailyQuote.author}</span>
          )}
        </p>
      </motion.div>

      {/* Level Badge */}
      <motion.div
        className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-surface-light/50 border border-white/5"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        <span className="text-sm">{getLevelEmoji(levelInfo.level)}</span>
        <span className="text-xs font-semibold text-text-primary">Lv.{levelInfo.level}</span>
        <span className="text-xs text-text-secondary">{levelInfo.title}</span>
        <div className="w-16 h-1.5 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
            style={{ width: `${levelInfo.progressPercent}%` }}
          />
        </div>
        <span className="text-[10px] text-text-secondary">{totalXP} XP</span>
      </motion.div>

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
          <circle cx="160" cy="160" r={radius} stroke="rgb(var(--color-surface-light))" strokeWidth="6" fill="none" />
          <circle cx="160" cy="160" r={radius} stroke="rgb(var(--color-primary) / 0.3)" strokeWidth="6" fill="none"
            strokeDasharray={circumference} strokeDashoffset={progressOffset} strokeLinecap="round"
            className="transition-all duration-1000 ease-out" />
          <circle cx="160" cy="160" r={radius - 14} stroke="rgb(var(--color-surface-light) / 0.5)" strokeWidth="4" fill="none" />
          {isRunning && (
            <circle cx="160" cy="160" r={radius - 14} stroke="rgb(var(--color-primary))" strokeWidth="4" fill="none"
              strokeDasharray={2 * Math.PI * (radius - 14)}
              strokeDashoffset={2 * Math.PI * (radius - 14) - sessionMinutes * 2 * Math.PI * (radius - 14)}
              strokeLinecap="round" className="transition-all duration-1000 ease-linear" />
          )}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-6xl font-mono font-bold text-text-primary tracking-wider"
            key={formatTime(elapsed)} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }}>
            {formatTime(elapsed)}
          </motion.span>
          {isRunning && (
            <motion.div className="flex items-center gap-1.5 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-text-secondary uppercase tracking-widest">Recording</span>
            </motion.div>
          )}
          {isPaused && (
            <motion.div className="flex items-center gap-1.5 mt-2" initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs text-amber-400 uppercase tracking-widest">Paused</span>
            </motion.div>
          )}
          {goalProgress >= 100 && (
            <motion.div className="flex items-center gap-1 mt-1"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-[10px] text-amber-400 font-semibold uppercase">Goal Met!</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Subject Tags */}
      <motion.div
        className="w-full max-w-md mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex gap-2 justify-center flex-wrap px-2">
          {subjects.map(subject => {
            const isSelected = currentSubject === subject.id;
            return (
              <button
                key={subject.id}
                onClick={() => toggleSubject(subject.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium
                           transition-all duration-200 active:scale-95 whitespace-nowrap
                           ${getSubjectBgClass(subject.color, isSelected)}`}
              >
                <span>{subject.emoji}</span>
                <span>{subject.name}</span>
              </button>
            );
          })}

          {/* Add Subject Button / Inline Input */}
          {!isAdding ? (
            subjects.length < MAX_SUBJECTS && (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed
                           border-white/20 text-xs font-medium text-text-secondary/60
                           hover:border-primary/40 hover:text-primary/60 transition-all active:scale-95"
              >
                <Plus size={12} />
                <span>Add</span>
              </button>
            )
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  ref={addInputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setAddError(null); }}
                  onKeyDown={handleAddKeyDown}
                  placeholder="Subject name"
                  maxLength={24}
                  className="w-32 px-3 py-1.5 rounded-full border border-primary/40 bg-surface-light/50
                             text-xs text-text-primary placeholder:text-text-secondary/40
                             focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                {addError && (
                  <p className="absolute -bottom-5 left-0 text-[9px] text-red-400 whitespace-nowrap">
                    {addError}
                  </p>
                )}
              </div>
              <button onClick={handleAddSubject}
                className="p-1.5 rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
                <Check size={12} />
              </button>
              <button onClick={() => { setIsAdding(false); setNewName(''); setAddError(null); }}
                className="p-1.5 rounded-full bg-surface-light/50 text-text-secondary hover:text-text-primary transition-colors">
                <X size={12} />
              </button>
            </div>
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
          <button onClick={startTimer}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-white font-semibold text-lg
                       hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/30
                       hover:shadow-xl hover:shadow-primary/40 active:scale-95">
            <Play size={22} fill="white" />
            Start Study
          </button>
        ) : (
          <>
            <button onClick={isRunning ? pauseTimer : startTimer}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-surface-light text-text-primary font-semibold
                         hover:bg-surface-light/80 transition-all duration-200 active:scale-95 border border-white/5">
              {isRunning ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button onClick={stopTimer}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-red-500/20 text-red-400 font-semibold
                         hover:bg-red-500/30 transition-all duration-200 active:scale-95 border border-red-500/20">
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
