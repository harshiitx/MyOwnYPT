'use client';

// ==========================================
// Shareable Daily Stats Card — Canvas-rendered PNG
// 4 formats: Instagram Story, WhatsApp, Twitter/X, Reddit
// Shows DAILY report with all-time level
// ==========================================

import { useRef, useCallback, useState } from 'react';
import { useStore } from '@/store/useStore';
import {
  getStreakInfo,
  getWeeklySummaries,
  getDailySummary,
  formatDuration,
  getStudyDate,
} from '@/lib/utils';
import { calculateTotalXP, getLevelInfo, getLevelEmoji } from '@/lib/xp';
import { getTheme } from '@/lib/themes';
import { getSubjectFromList } from '@/lib/subjects';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Download, X } from 'lucide-react';

// ---- Format Definitions ----

type ShareFormat = 'instagram' | 'whatsapp' | 'twitter' | 'reddit';

interface FormatConfig {
  width: number;
  height: number;
  label: string;
  icon: string;
}

const SHARE_FORMATS: Record<ShareFormat, FormatConfig> = {
  instagram: { width: 1080, height: 1920, label: 'Instagram Story', icon: '📸' },
  whatsapp:  { width: 1080, height: 1080, label: 'WhatsApp', icon: '💬' },
  twitter:   { width: 1200, height: 675,  label: 'Twitter / X', icon: '𝕏' },
  reddit:    { width: 1200, height: 628,  label: 'Reddit', icon: '🤖' },
};

const FORMAT_ORDER: ShareFormat[] = ['instagram', 'whatsapp', 'twitter', 'reddit'];

export default function ShareableCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ShareFormat>('instagram');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { sessions, settings, subjects } = useStore();

  const today = getStudyDate();
  const todaySummary = getDailySummary(sessions, today);
  const streakInfo = getStreakInfo(sessions, 1);
  const totalXP = calculateTotalXP(sessions);
  const levelInfo = getLevelInfo(totalXP);
  const weeklySummaries = getWeeklySummaries(sessions, 7);
  const theme = getTheme(settings.theme);

  // Today's subject breakdown
  const todayCompletedSessions = sessions.filter(s => s.date === today && s.endTime !== null);
  const subjectMap = new Map<string, number>();
  for (const s of todayCompletedSessions) {
    const key = s.subject || 'general';
    subjectMap.set(key, (subjectMap.get(key) || 0) + s.duration);
  }
  const todaySubjects = Array.from(subjectMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Goal progress
  const goalPercent = Math.min(
    Math.round((todaySummary.totalSeconds / (settings.dailyGoalHours * 3600)) * 100),
    100
  );

  // ---- Canvas Drawing ----

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cfg = SHARE_FORMATS[format];
    const W = cfg.width;
    const H = cfg.height;
    canvas.width = W;
    canvas.height = H;

    // Parse theme colors
    const rgb = (c: string) => `rgb(${c})`;
    const rgba = (c: string, a: number) => `rgba(${c}, ${a})`;
    const primary = rgb(theme.colors.primary);
    const accent = rgb(theme.colors.accent);
    const surface = rgb(theme.colors.surface);
    const surfaceLight = rgb(theme.colors.surfaceLight);
    const textPri = rgb(theme.colors.textPrimary);
    const textSec = rgb(theme.colors.textSecondary);

    // Scale factor: base is 1080px width
    const S = W / 1080;

    // --- Background ---
    const bgGrad = ctx.createLinearGradient(0, 0, W * 0.3, H);
    bgGrad.addColorStop(0, surface);
    bgGrad.addColorStop(0.5, surfaceLight);
    bgGrad.addColorStop(1, surface);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid pattern
    ctx.strokeStyle = rgba(theme.colors.textSecondary, 0.03);
    ctx.lineWidth = 1;
    const gridSize = 40 * S;
    for (let x = gridSize; x < W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = gridSize; y < H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Accent strip at top
    const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
    accentGrad.addColorStop(0, primary);
    accentGrad.addColorStop(1, accent);
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, W, 4 * S);

    // Glow at top
    const glowGrad = ctx.createLinearGradient(0, 0, 0, 200 * S);
    glowGrad.addColorStop(0, rgba(theme.colors.primary, 0.08));
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, 200 * S);

    // Border
    ctx.strokeStyle = rgba(theme.colors.textSecondary, 0.08);
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // --- Render based on layout type ---
    const isVertical = H / W > 1.5;   // Instagram
    const isSquare = Math.abs(H / W - 1) < 0.2; // WhatsApp
    // else horizontal (Twitter, Reddit)

    if (isVertical) {
      drawVerticalLayout(ctx, W, H, S);
    } else if (isSquare) {
      drawSquareLayout(ctx, W, H, S);
    } else {
      drawHorizontalLayout(ctx, W, H, S);
    }

    // --- Helper functions that use closure variables ---

    function drawVerticalLayout(ctx: CanvasRenderingContext2D, W: number, H: number, S: number) {
      let y = 60 * S;

      // Date
      ctx.font = `${20 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.textAlign = 'center';
      ctx.fillText(formatDate(), W / 2, y);
      y += 50 * S;

      // "Daily Report" heading
      ctx.font = `bold ${48 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textPri;
      ctx.fillText('📖 Daily Report', W / 2, y);
      y += 80 * S;

      // Large time display
      ctx.font = `bold ${120 * S}px system-ui, sans-serif`;
      ctx.fillStyle = primary;
      ctx.fillText(formatDuration(todaySummary.totalSeconds), W / 2, y);
      y += 40 * S;

      ctx.font = `${24 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.fillText('studied today', W / 2, y);
      y += 80 * S;

      // Goal progress bar
      const barX = 80 * S;
      const barW = W - 160 * S;
      const barH = 24 * S;

      ctx.fillStyle = surfaceLight;
      roundRect(ctx, barX, y, barW, barH, 12 * S);
      ctx.fill();

      const progressGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      progressGrad.addColorStop(0, primary);
      progressGrad.addColorStop(1, accent);
      ctx.fillStyle = progressGrad;
      roundRect(ctx, barX, y, Math.max(barW * goalPercent / 100, 12 * S), barH, 12 * S);
      ctx.fill();

      y += barH + 20 * S;
      ctx.font = `${20 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.fillText(`${goalPercent}% of ${settings.dailyGoalHours}h daily goal`, W / 2, y);
      y += 80 * S;

      // Stats grid (2x2)
      const statsData = [
        { emoji: '📝', value: `${todaySummary.sessionCount}`, label: 'Sessions' },
        { emoji: '🔥', value: `${streakInfo.currentStreak}`, label: 'Day Streak' },
        { emoji: '⏱️', value: `${streakInfo.totalHoursAllTime.toFixed(1)}h`, label: 'All-Time' },
        { emoji: '🏆', value: `${streakInfo.longestStreak}d`, label: 'Best Streak' },
      ];

      const boxW = (W - 200 * S) / 2;
      const boxH = 120 * S;
      const gap = 20 * S;
      const gridX = 80 * S;

      statsData.forEach((stat, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = gridX + col * (boxW + gap);
        const by = y + row * (boxH + gap);

        ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.6);
        roundRect(ctx, bx, by, boxW, boxH, 16 * S);
        ctx.fill();

        ctx.font = `${28 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textPri;
        ctx.fillText(`${stat.emoji}`, bx + boxW / 2, by + 35 * S);

        ctx.font = `bold ${30 * S}px system-ui, sans-serif`;
        ctx.fillText(stat.value, bx + boxW / 2, by + 72 * S);

        ctx.font = `${16 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textSec;
        ctx.fillText(stat.label, bx + boxW / 2, by + 100 * S);
      });

      y += 2 * (boxH + gap) + 40 * S;

      // Subject breakdown
      if (todaySubjects.length > 0) {
        ctx.font = `bold ${24 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textPri;
        ctx.textAlign = 'left';
        ctx.fillText('Subjects Today', 80 * S, y);
        y += 40 * S;

        todaySubjects.forEach(([subjectId, seconds]) => {
          const sub = getSubjectFromList(subjectId, subjects);
          const name = sub ? `${sub.emoji} ${sub.name}` : (subjectId === 'general' ? '📌 General' : subjectId);
          ctx.font = `${20 * S}px system-ui, sans-serif`;
          ctx.fillStyle = textPri;
          ctx.textAlign = 'left';
          ctx.fillText(name, 80 * S, y);
          ctx.textAlign = 'right';
          ctx.fillStyle = textSec;
          ctx.fillText(formatDuration(seconds), W - 80 * S, y);
          y += 40 * S;
        });

        ctx.textAlign = 'center';
        y += 20 * S;
      }

      // Weekly bars
      drawWeeklyBars(ctx, 80 * S, y, W - 160 * S, 120 * S, S);
      y += 180 * S;

      // Level badge at bottom
      drawLevelBadge(ctx, W / 2, H - 100 * S, S);
    }

    function drawSquareLayout(ctx: CanvasRenderingContext2D, W: number, H: number, S: number) {
      let y = 50 * S;

      // Header row
      ctx.font = `${18 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.textAlign = 'left';
      ctx.fillText(formatDate(), 60 * S, y);
      ctx.textAlign = 'right';
      ctx.fillText(`📖 Daily Report`, W - 60 * S, y);
      y += 60 * S;

      // Large time
      ctx.textAlign = 'center';
      ctx.font = `bold ${96 * S}px system-ui, sans-serif`;
      ctx.fillStyle = primary;
      ctx.fillText(formatDuration(todaySummary.totalSeconds), W / 2, y);
      y += 30 * S;

      ctx.font = `${20 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.fillText('studied today', W / 2, y);
      y += 50 * S;

      // Goal bar
      const barX = 60 * S;
      const barW = W - 120 * S;
      const barH = 20 * S;
      ctx.fillStyle = surfaceLight;
      roundRect(ctx, barX, y, barW, barH, 10 * S);
      ctx.fill();
      const pGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      pGrad.addColorStop(0, primary);
      pGrad.addColorStop(1, accent);
      ctx.fillStyle = pGrad;
      roundRect(ctx, barX, y, Math.max(barW * goalPercent / 100, 10 * S), barH, 10 * S);
      ctx.fill();
      y += barH + 16 * S;

      ctx.font = `${16 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.fillText(`${goalPercent}% of ${settings.dailyGoalHours}h goal`, W / 2, y);
      y += 50 * S;

      // Stats row (4 items)
      const stats = [
        { emoji: '📝', value: `${todaySummary.sessionCount}`, label: 'Sessions' },
        { emoji: '🔥', value: `${streakInfo.currentStreak}d`, label: 'Streak' },
        { emoji: '⏱️', value: `${streakInfo.totalHoursAllTime.toFixed(1)}h`, label: 'Total' },
        { emoji: '🏆', value: `${streakInfo.longestStreak}d`, label: 'Best' },
      ];

      const sBoxW = (W - 160 * S) / 4;
      const sBoxH = 90 * S;
      stats.forEach((stat, i) => {
        const bx = 60 * S + i * (sBoxW + 14 * S);
        ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.6);
        roundRect(ctx, bx, y, sBoxW, sBoxH, 12 * S);
        ctx.fill();

        ctx.font = `${22 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textPri;
        ctx.fillText(stat.emoji, bx + sBoxW / 2, y + 28 * S);
        ctx.font = `bold ${22 * S}px system-ui, sans-serif`;
        ctx.fillText(stat.value, bx + sBoxW / 2, y + 55 * S);
        ctx.font = `${12 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textSec;
        ctx.fillText(stat.label, bx + sBoxW / 2, y + 78 * S);
      });

      y += sBoxH + 40 * S;

      // Subject pills
      if (todaySubjects.length > 0) {
        ctx.textAlign = 'center';
        let pillX = 60 * S;
        const pillY = y;
        const pillH = 36 * S;
        ctx.textAlign = 'left';

        todaySubjects.forEach(([subjectId, seconds]) => {
          const sub = getSubjectFromList(subjectId, subjects);
          const name = sub ? `${sub.emoji} ${sub.name}` : (subjectId === 'general' ? '📌 General' : subjectId);
          const text = `${name} • ${formatDuration(seconds)}`;
          ctx.font = `${16 * S}px system-ui, sans-serif`;
          const tw = ctx.measureText(text).width + 24 * S;

          if (pillX + tw > W - 60 * S) return; // skip if overflows

          ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.6);
          roundRect(ctx, pillX, pillY, tw, pillH, 18 * S);
          ctx.fill();

          ctx.fillStyle = textPri;
          ctx.fillText(text, pillX + 12 * S, pillY + 23 * S);
          pillX += tw + 10 * S;
        });

        y += pillH + 30 * S;
      }

      // Weekly bars
      ctx.textAlign = 'center';
      drawWeeklyBars(ctx, 60 * S, y, W - 120 * S, 80 * S, S);

      // Level badge at bottom
      drawLevelBadge(ctx, W / 2, H - 50 * S, S);
    }

    function drawHorizontalLayout(ctx: CanvasRenderingContext2D, W: number, H: number, S: number) {
      const halfW = W / 2;

      // Left half: Big time + date
      let ly = 60 * S;

      ctx.textAlign = 'left';
      ctx.font = `${16 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.fillText(formatDate(), 50 * S, ly);

      ctx.textAlign = 'right';
      ctx.fillText('📖 Daily Report', W - 50 * S, ly);

      ly += 70 * S;
      ctx.textAlign = 'left';
      ctx.font = `bold ${80 * S}px system-ui, sans-serif`;
      ctx.fillStyle = primary;
      ctx.fillText(formatDuration(todaySummary.totalSeconds), 50 * S, ly);

      ly += 30 * S;
      ctx.font = `${18 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.fillText('studied today', 50 * S, ly);

      ly += 40 * S;

      // Goal bar (left side)
      const barX = 50 * S;
      const barW = halfW - 80 * S;
      const barH = 16 * S;
      ctx.fillStyle = surfaceLight;
      roundRect(ctx, barX, ly, barW, barH, 8 * S);
      ctx.fill();
      const pGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      pGrad.addColorStop(0, primary);
      pGrad.addColorStop(1, accent);
      ctx.fillStyle = pGrad;
      roundRect(ctx, barX, ly, Math.max(barW * goalPercent / 100, 8 * S), barH, 8 * S);
      ctx.fill();

      ly += barH + 14 * S;
      ctx.font = `${14 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.fillText(`${goalPercent}% of ${settings.dailyGoalHours}h goal`, 50 * S, ly);

      ly += 40 * S;

      // Subject tags (left, compact)
      if (todaySubjects.length > 0) {
        let tagX = 50 * S;
        todaySubjects.slice(0, 3).forEach(([subjectId, seconds]) => {
          const sub = getSubjectFromList(subjectId, subjects);
          const name = sub ? `${sub.emoji} ${sub.name}` : (subjectId === 'general' ? '📌 General' : subjectId);
          const text = `${name} ${formatDuration(seconds)}`;
          ctx.font = `${13 * S}px system-ui, sans-serif`;
          const tw = ctx.measureText(text).width + 20 * S;

          if (tagX + tw > halfW - 20 * S) return;

          ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.6);
          roundRect(ctx, tagX, ly, tw, 28 * S, 14 * S);
          ctx.fill();

          ctx.fillStyle = textPri;
          ctx.fillText(text, tagX + 10 * S, ly + 18 * S);
          tagX += tw + 8 * S;
        });
      }

      // Level badge (left, bottom)
      drawLevelBadge(ctx, 50 * S + (halfW - 80 * S) / 2, H - 50 * S, S * 0.9);

      // Right half: Stats + weekly chart
      let ry = 60 * S;

      // Stats (2x2 grid)
      const stats = [
        { emoji: '📝', value: `${todaySummary.sessionCount}`, label: 'Sessions' },
        { emoji: '🔥', value: `${streakInfo.currentStreak}d`, label: 'Streak' },
        { emoji: '⏱️', value: `${streakInfo.totalHoursAllTime.toFixed(1)}h`, label: 'All-Time' },
        { emoji: '🏆', value: `${streakInfo.longestStreak}d`, label: 'Best' },
      ];

      const rBoxW = (halfW - 100 * S) / 2;
      const rBoxH = 80 * S;
      const rGap = 12 * S;
      const rStartX = halfW + 20 * S;

      stats.forEach((stat, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const bx = rStartX + col * (rBoxW + rGap);
        const by = ry + row * (rBoxH + rGap);

        ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.6);
        roundRect(ctx, bx, by, rBoxW, rBoxH, 12 * S);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.font = `${20 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textPri;
        ctx.fillText(stat.emoji, bx + rBoxW / 2, by + 24 * S);
        ctx.font = `bold ${20 * S}px system-ui, sans-serif`;
        ctx.fillText(stat.value, bx + rBoxW / 2, by + 50 * S);
        ctx.font = `${11 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textSec;
        ctx.fillText(stat.label, bx + rBoxW / 2, by + 68 * S);
      });

      ry += 2 * (rBoxH + rGap) + 20 * S;

      // Weekly bars (right side)
      ctx.textAlign = 'center';
      drawWeeklyBars(ctx, rStartX, ry, halfW - 70 * S, Math.min(H - ry - 60 * S, 120 * S), S);
    }

    // ---- Shared Drawing Helpers ----

    function drawWeeklyBars(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      S: number
    ) {
      // Label
      ctx.font = `${14 * S}px system-ui, sans-serif`;
      ctx.fillStyle = textSec;
      ctx.textAlign = 'left';
      ctx.fillText('This Week', x, y);
      y += 24 * S;

      const maxSec = Math.max(...weeklySummaries.map(d => d.totalSeconds), 1);
      const barW = (width - 6 * 8 * S) / 7;
      const chartH = height - 30 * S;

      weeklySummaries.forEach((day, i) => {
        const bx = x + i * (barW + 8 * S);
        const bh = Math.max((day.totalSeconds / maxSec) * chartH, 3 * S);
        const by = y + chartH - bh;

        if (day.totalSeconds > 0) {
          const barGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
          barGrad.addColorStop(0, primary);
          barGrad.addColorStop(1, accent);
          ctx.fillStyle = barGrad;
        } else {
          ctx.fillStyle = surfaceLight;
        }
        roundRect(ctx, bx, by, barW, bh, 4 * S);
        ctx.fill();

        // Day label
        const dayName = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });
        ctx.font = `${11 * S}px system-ui, sans-serif`;
        ctx.fillStyle = textSec;
        ctx.textAlign = 'center';
        ctx.fillText(dayName, bx + barW / 2, y + chartH + 16 * S);
      });
      ctx.textAlign = 'left';
    }

    function drawLevelBadge(ctx: CanvasRenderingContext2D, cx: number, cy: number, S: number) {
      const text = `${getLevelEmoji(levelInfo.level)} Lv.${levelInfo.level} — ${levelInfo.title} • ${totalXP} XP`;
      ctx.font = `bold ${18 * S}px system-ui, sans-serif`;
      const tw = ctx.measureText(text).width + 40 * S;
      const bh = 36 * S;
      const bx = cx - tw / 2;
      const by = cy - bh / 2;

      // Badge background
      const badgeGrad = ctx.createLinearGradient(bx, by, bx + tw, by);
      badgeGrad.addColorStop(0, rgba(theme.colors.primary, 0.15));
      badgeGrad.addColorStop(1, rgba(theme.colors.accent, 0.15));
      ctx.fillStyle = badgeGrad;
      roundRect(ctx, bx, by, tw, bh, 18 * S);
      ctx.fill();

      // Badge border
      ctx.strokeStyle = rgba(theme.colors.primary, 0.3);
      ctx.lineWidth = 1.5 * S;
      roundRect(ctx, bx, by, tw, bh, 18 * S);
      ctx.stroke();

      // Badge text
      ctx.fillStyle = textPri;
      ctx.textAlign = 'center';
      ctx.fillText(text, cx, cy + 6 * S);
      ctx.textAlign = 'left';
    }

    function formatDate(): string {
      return new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [format, todaySummary, streakInfo, totalXP, levelInfo, weeklySummaries, theme, todaySubjects, goalPercent, subjects, settings.dailyGoalHours]);

  // Redraw when format changes
  const handleFormatChange = (newFormat: ShareFormat) => {
    setFormat(newFormat);
    // Redraw on next tick after state updates
    setTimeout(() => {
      drawCard();
    }, 50);
  };

  const handleDownload = () => {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-daily-${format}-${getStudyDate()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const handleShare = async () => {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
    if (!blob) return;

    const file = new File([blob], `study-daily-${format}.png`, { type: 'image/png' });

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My Study Stats' });
        return;
      } catch {
        // Fall through to download
      }
    }

    // Fallback: download
    handleDownload();
  };

  // Preview dimensions
  const cfg = SHARE_FORMATS[format];
  const maxPreviewHeight = format === 'instagram' ? 320 : format === 'whatsapp' ? 280 : 240;
  const previewAspect = cfg.width / cfg.height;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(drawCard, 50);
        }}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 border border-primary/30
                   text-primary text-sm font-medium hover:bg-primary/30 transition-all active:scale-95"
      >
        <Share2 size={16} />
        Share Daily
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl border border-white/10 shadow-2xl max-w-[640px] w-full overflow-hidden max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h3 className="text-lg font-semibold text-text-primary">Share Daily Report</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-light text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Format Selector */}
              <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-none">
                {FORMAT_ORDER.map(f => {
                  const fc = SHARE_FORMATS[f];
                  const isActive = format === f;
                  return (
                    <button
                      key={f}
                      onClick={() => handleFormatChange(f)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap
                                 transition-all active:scale-95 border ${
                        isActive
                          ? 'bg-primary/20 border-primary/40 text-primary'
                          : 'bg-surface-light/30 border-white/5 text-text-secondary hover:bg-surface-light/50'
                      }`}
                    >
                      <span>{fc.icon}</span>
                      <span>{fc.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Canvas Preview */}
              <div className="px-5 py-3 flex justify-center">
                <div
                  style={{
                    height: `${maxPreviewHeight}px`,
                    width: `${maxPreviewHeight * previewAspect}px`,
                    maxWidth: '100%',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-xl border border-white/5"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>

              {/* Dimension indicator */}
              <p className="text-center text-[10px] text-text-secondary/50 pb-2">
                {cfg.width}×{cfg.height}px
              </p>

              {/* Actions */}
              <div className="flex gap-3 px-5 py-4 border-t border-white/5">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white
                             font-semibold hover:bg-primary-dark transition-all active:scale-95"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface-light border border-white/10
                             text-text-primary font-semibold hover:bg-surface-light/80 transition-all active:scale-95"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Helper: draw a rounded rectangle path
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
