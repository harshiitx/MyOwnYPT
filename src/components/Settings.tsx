'use client';

import { useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { THEMES, WALLPAPERS } from '@/lib/themes';
import { exportAllData, importAllData, clearAllData } from '@/lib/storage';
import { ThemeId, WallpaperId } from '@/lib/types';
import {
  getSubjectBgClass,
  validateSubjectName,
  createSubject,
  MAX_SUBJECTS,
} from '@/lib/subjects';
import { motion } from 'framer-motion';
import {
  Palette,
  ImageIcon,
  Target,
  Download,
  Upload,
  Trash2,
  Volume2,
  VolumeX,
  Check,
  AlertTriangle,
  Tags,
  Plus,
  X,
} from 'lucide-react';

export default function Settings() {
  const {
    settings, updateSettings, clearAllData: clearStore,
    subjects, addSubject, removeSubject,
  } = useStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subject management
  const [newSubjectName, setNewSubjectName] = useState('');
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-timer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const success = importAllData(content);
      setImportStatus(success ? 'success' : 'error');
      if (success) {
        window.location.reload();
      }
      setTimeout(() => setImportStatus('idle'), 3000);
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    clearAllData();
    clearStore();
    setShowClearConfirm(false);
  };

  const handleAddSubject = () => {
    const result = validateSubjectName(newSubjectName, subjects);
    if (!result.valid) {
      setSubjectError(result.error || 'Invalid name');
      return;
    }
    const newSubject = createSubject(result.sanitized, subjects);
    addSubject(newSubject);
    setNewSubjectName('');
    setSubjectError(null);
  };

  const handleSubjectKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddSubject();
    if (e.key === 'Escape') {
      setNewSubjectName('');
      setSubjectError(null);
    }
  };

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
      <motion.h1 variants={itemVariants} className="text-2xl font-bold text-text-primary mb-6">
        Settings
      </motion.h1>

      {/* Subject Management */}
      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Tags size={18} />
          Subject Tags
        </h2>
        <div className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-text-secondary mb-3">
            Manage your study subjects. Tap a subject while studying to tag your session.
          </p>

          {/* Existing subjects */}
          <div className="flex flex-wrap gap-2 mb-4">
            {subjects.map(subject => (
              <div
                key={subject.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
                           ${getSubjectBgClass(subject.color, true)}`}
              >
                <span>{subject.emoji}</span>
                <span>{subject.name}</span>
                {confirmDeleteId === subject.id ? (
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={() => { removeSubject(subject.id); setConfirmDeleteId(null); }}
                      className="p-0.5 rounded-full bg-red-500/30 text-red-300 hover:bg-red-500/50 transition-colors"
                      title="Confirm delete"
                    >
                      <Check size={10} />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="p-0.5 rounded-full bg-surface/50 text-text-secondary hover:text-text-primary transition-colors"
                      title="Cancel"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(subject.id)}
                    className="p-0.5 rounded-full hover:bg-white/10 text-current opacity-50 hover:opacity-100 transition-all ml-0.5"
                    title="Remove subject"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add new subject */}
          {subjects.length < MAX_SUBJECTS && (
            <div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => { setNewSubjectName(e.target.value); setSubjectError(null); }}
                    onKeyDown={handleSubjectKeyDown}
                    placeholder="New subject name..."
                    maxLength={24}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-surface/50
                               text-sm text-text-primary placeholder:text-text-secondary/40
                               focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/30"
                  />
                </div>
                <button
                  onClick={handleAddSubject}
                  disabled={!newSubjectName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-medium
                             hover:bg-primary/30 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
              {subjectError && (
                <p className="text-xs text-red-400 mt-1.5 ml-1">{subjectError}</p>
              )}
              <p className="text-[10px] text-text-secondary/50 mt-1.5 ml-1">
                {subjects.length}/{MAX_SUBJECTS} subjects • Letters, numbers, spaces, basic punctuation
              </p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Theme Selection */}
      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Palette size={18} />
          Color Theme
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => updateSettings({ theme: theme.id as ThemeId })}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-200 ${
                settings.theme === theme.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-white/5 bg-surface-light/30 hover:bg-surface-light/50'
              }`}
            >
              {settings.theme === theme.id && (
                <div className="absolute top-2 right-2">
                  <Check size={14} className="text-primary" />
                </div>
              )}
              <div
                className="w-10 h-10 rounded-full"
                style={{
                  background: `linear-gradient(135deg, rgb(${theme.colors.primary}), rgb(${theme.colors.accent}))`,
                }}
              />
              <span className="text-xs font-medium text-text-primary">
                {theme.emoji} {theme.name}
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Wallpaper Selection */}
      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
          <ImageIcon size={18} />
          Background
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {WALLPAPERS.map(wp => (
            <button
              key={wp.id}
              onClick={() => updateSettings({ wallpaper: wp.id as WallpaperId })}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 overflow-hidden ${
                settings.wallpaper === wp.id
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                  : 'border-white/5 bg-surface-light/30 hover:bg-surface-light/50'
              }`}
            >
              {settings.wallpaper === wp.id && (
                <div className="absolute top-1.5 right-1.5 z-20">
                  <Check size={12} className="text-primary" />
                </div>
              )}
              <div className="relative w-full h-14 rounded-lg overflow-hidden bg-surface-dark">
                {wp.className && (
                  <div className={`absolute inset-0 ${wp.className}`} style={{ animationDuration: '4s' }} />
                )}
              </div>
              <span className="text-xs font-medium text-text-primary flex items-center gap-1">
                {wp.emoji} {wp.name}
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Daily Goal */}
      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
          <Target size={18} />
          Daily Goal
        </h2>
        <div className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-secondary">Hours per day</span>
            <span className="text-lg font-bold text-primary">{settings.dailyGoalHours}h</span>
          </div>
          <input
            type="range"
            min="1"
            max="16"
            step="0.5"
            value={settings.dailyGoalHours}
            onChange={(e) => updateSettings({ dailyGoalHours: parseFloat(e.target.value) })}
            className="w-full accent-primary h-2 bg-surface rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
                       [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/40"
          />
          <div className="flex justify-between text-[10px] text-text-secondary/60 mt-1">
            <span>1h</span>
            <span>8h</span>
            <span>16h</span>
          </div>
        </div>
      </motion.section>

      {/* Sound */}
      <motion.section variants={itemVariants} className="mb-8">
        <div className="bg-surface-light/50 backdrop-blur-sm rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? (
                <Volume2 size={18} className="text-primary" />
              ) : (
                <VolumeX size={18} className="text-text-secondary" />
              )}
              <div>
                <p className="text-sm font-medium text-text-primary">Achievement Sounds</p>
                <p className="text-xs text-text-secondary">Play sound on new achievements</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                settings.soundEnabled ? 'bg-primary' : 'bg-surface'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                  settings.soundEnabled ? 'left-6' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Data Management */}
      <motion.section variants={itemVariants} className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
          💾 Data
        </h2>

        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-light/50 border border-white/5
                       hover:bg-surface-light/70 transition-all text-left"
          >
            <Download size={18} className="text-primary" />
            <div>
              <p className="text-sm font-medium text-text-primary">Export Data</p>
              <p className="text-xs text-text-secondary">Download all your data as JSON</p>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-surface-light/50 border border-white/5
                       hover:bg-surface-light/70 transition-all text-left"
          >
            <Upload size={18} className="text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-text-primary">Import Data</p>
              <p className="text-xs text-text-secondary">
                {importStatus === 'success' ? '✅ Imported successfully!' :
                 importStatus === 'error' ? '❌ Invalid file format' :
                 'Restore from a backup file'}
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20
                         hover:bg-red-500/20 transition-all text-left"
            >
              <Trash2 size={18} className="text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">Clear All Data</p>
                <p className="text-xs text-red-400/60">Permanently delete everything</p>
              </div>
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={18} className="text-red-400" />
                <p className="text-sm font-semibold text-red-400">Are you sure?</p>
              </div>
              <p className="text-xs text-red-400/80 mb-3">
                This will permanently delete all your study sessions, achievements, and settings. This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearData}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold
                             hover:bg-red-600 transition-all"
                >
                  Delete Everything
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-surface-light text-text-primary text-sm font-semibold
                             hover:bg-surface-light/80 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* About */}
      <motion.section variants={itemVariants}>
        <div className="bg-surface-light/30 rounded-2xl p-4 border border-white/5 text-center">
          <p className="text-lg mb-1">📖</p>
          <p className="text-sm font-medium text-text-primary">Study Timer</p>
          <p className="text-xs text-text-secondary mt-1">
            Your data is stored locally in your browser. Export regularly for backup.
          </p>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-text-secondary">
              Made by <span className="font-semibold text-primary">Daaku Harshit Bhardwaj</span>
            </p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
