'use client';

// ==========================================
// Shareable Daily Stats Card — Single 9:16 PNG
// Clean vertical layout with good padding
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

const W = 1080;
const H = 1920;
const PAD = 80; // side padding

export default function ShareableCard() {
  const [isOpen, setIsOpen] = useState(false);
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
  const todayCompleted = sessions.filter(s => s.date === today && s.endTime !== null);
  const subjectMap = new Map<string, number>();
  for (const s of todayCompleted) {
    const key = s.subject || 'general';
    subjectMap.set(key, (subjectMap.get(key) || 0) + s.duration);
  }
  const todaySubjects = Array.from(subjectMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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

    canvas.width = W;
    canvas.height = H;

    // Canvas needs comma-separated rgba values; theme stores "R G B"
    const rgb = (c: string) => `rgb(${c.replace(/ /g, ', ')})`;
    const rgba = (c: string, a: number) => `rgba(${c.replace(/ /g, ', ')}, ${a})`;

    const primary = rgb(theme.colors.primary);
    const accent = rgb(theme.colors.accent);
    const surface = rgb(theme.colors.surface);
    const surfaceLight = rgb(theme.colors.surfaceLight);
    const textPri = rgb(theme.colors.textPrimary);
    const textSec = rgb(theme.colors.textSecondary);

    // ---- Background ----
    const bgGrad = ctx.createLinearGradient(0, 0, W * 0.3, H);
    bgGrad.addColorStop(0, surface);
    bgGrad.addColorStop(0.5, surfaceLight);
    bgGrad.addColorStop(1, surface);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Subtle dot grid
    ctx.fillStyle = rgba(theme.colors.textSecondary, 0.04);
    for (let gx = 40; gx < W; gx += 40) {
      for (let gy = 40; gy < H; gy += 40) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Accent strip at top
    const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
    accentGrad.addColorStop(0, primary);
    accentGrad.addColorStop(1, accent);
    ctx.fillStyle = accentGrad;
    ctx.fillRect(0, 0, W, 6);

    // Glow
    const glowGrad = ctx.createLinearGradient(0, 0, 0, 300);
    glowGrad.addColorStop(0, rgba(theme.colors.primary, 0.06));
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, 300);

    // Outer rounded border
    ctx.strokeStyle = rgba(theme.colors.textSecondary, 0.06);
    ctx.lineWidth = 2;
    roundRect(ctx, 1, 1, W - 2, H - 2, 0);
    ctx.stroke();

    // ---- Content (vertically balanced across 1920px) ----
    let y = 150;

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    ctx.font = '400 28px system-ui, sans-serif';
    ctx.fillStyle = textSec;
    ctx.textAlign = 'center';
    ctx.fillText(dateStr, W / 2, y);
    y += 80;

    // "Daily Report" heading
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.fillStyle = textPri;
    ctx.fillText('Daily Report', W / 2, y);
    y += 130;

    // ── Big time ──
    ctx.font = 'bold 140px system-ui, sans-serif';
    ctx.fillStyle = primary;
    ctx.fillText(formatDuration(todaySummary.totalSeconds), W / 2, y);
    y += 55;

    ctx.font = '400 28px system-ui, sans-serif';
    ctx.fillStyle = textSec;
    ctx.fillText('studied today', W / 2, y);
    y += 110;

    // ── Goal progress bar ──
    const barX = PAD;
    const barW = W - PAD * 2;
    const barH = 28;

    ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.8);
    roundRect(ctx, barX, y, barW, barH, 14);
    ctx.fill();

    if (goalPercent > 0) {
      const progressGrad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      progressGrad.addColorStop(0, primary);
      progressGrad.addColorStop(1, accent);
      ctx.fillStyle = progressGrad;
      roundRect(ctx, barX, y, Math.max(barW * goalPercent / 100, 14), barH, 14);
      ctx.fill();
    }

    y += barH + 28;
    ctx.font = '400 24px system-ui, sans-serif';
    ctx.fillStyle = textSec;
    ctx.textAlign = 'center';
    ctx.fillText(`${goalPercent}% of ${settings.dailyGoalHours}h daily goal`, W / 2, y);
    y += 110;

    // ── Stats grid (2×2) ──
    const stats = [
      { emoji: '📝', value: `${todaySummary.sessionCount}`, label: 'Sessions' },
      { emoji: '🔥', value: `${streakInfo.currentStreak}`, label: 'Day Streak' },
      { emoji: '⏱️', value: `${streakInfo.totalHoursAllTime.toFixed(1)}h`, label: 'All-Time' },
      { emoji: '🏆', value: `${streakInfo.longestStreak}d`, label: 'Best Streak' },
    ];

    const boxGap = 28;
    const boxW = (W - PAD * 2 - boxGap) / 2;
    const boxH = 155;

    stats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = PAD + col * (boxW + boxGap);
      const by = y + row * (boxH + boxGap);

      ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.5);
      roundRect(ctx, bx, by, boxW, boxH, 20);
      ctx.fill();
      ctx.strokeStyle = rgba(theme.colors.textSecondary, 0.06);
      ctx.lineWidth = 1;
      roundRect(ctx, bx, by, boxW, boxH, 20);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.font = '34px system-ui, sans-serif';
      ctx.fillStyle = textPri;
      ctx.fillText(stat.emoji, bx + boxW / 2, by + 48);

      ctx.font = 'bold 38px system-ui, sans-serif';
      ctx.fillStyle = textPri;
      ctx.fillText(stat.value, bx + boxW / 2, by + 96);

      ctx.font = '400 20px system-ui, sans-serif';
      ctx.fillStyle = textSec;
      ctx.fillText(stat.label, bx + boxW / 2, by + 130);
    });

    y += 2 * (boxH + boxGap) + 70;

    // ── Subjects today ──
    if (todaySubjects.length > 0) {
      ctx.font = 'bold 28px system-ui, sans-serif';
      ctx.fillStyle = textPri;
      ctx.textAlign = 'left';
      ctx.fillText('Subjects Today', PAD, y);
      y += 50;

      todaySubjects.forEach(([subjectId, seconds]) => {
        const sub = getSubjectFromList(subjectId, subjects);
        const name = sub ? `${sub.emoji} ${sub.name}` : (subjectId === 'general' ? '📌 General' : subjectId);

        // Row background
        ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.35);
        roundRect(ctx, PAD, y - 28, W - PAD * 2, 48, 14);
        ctx.fill();

        ctx.font = '400 24px system-ui, sans-serif';
        ctx.fillStyle = textPri;
        ctx.textAlign = 'left';
        ctx.fillText(name, PAD + 16, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = textSec;
        ctx.fillText(formatDuration(seconds), W - PAD - 16, y);
        y += 62;
      });

      y += 50;
    }

    // ── Weekly chart ──
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillStyle = textPri;
    ctx.textAlign = 'left';
    ctx.fillText('This Week', PAD, y);
    y += 44;

    const chartW = W - PAD * 2;
    const chartH = 200;
    const maxSec = Math.max(...weeklySummaries.map(d => d.totalSeconds), 1);
    const colGap = 14;
    const colW = (chartW - 6 * colGap) / 7;

    weeklySummaries.forEach((day, i) => {
      const bx = PAD + i * (colW + colGap);
      const bh = Math.max((day.totalSeconds / maxSec) * chartH, 6);
      const by = y + chartH - bh;

      if (day.totalSeconds > 0) {
        const barGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
        barGrad.addColorStop(0, primary);
        barGrad.addColorStop(1, accent);
        ctx.fillStyle = barGrad;
      } else {
        ctx.fillStyle = rgba(theme.colors.surfaceLight, 0.5);
      }
      roundRect(ctx, bx, by, colW, bh, 8);
      ctx.fill();

      // Day label
      const dayName = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });
      ctx.font = '400 20px system-ui, sans-serif';
      ctx.fillStyle = textSec;
      ctx.textAlign = 'center';
      ctx.fillText(dayName, bx + colW / 2, y + chartH + 32);
    });

    // ── Level badge ──
    const badgeY = H - 160;
    const badgeText = `${getLevelEmoji(levelInfo.level)} Lv.${levelInfo.level} — ${levelInfo.title} • ${totalXP} XP`;
    ctx.font = 'bold 24px system-ui, sans-serif';
    const badgeTW = ctx.measureText(badgeText).width + 60;
    const badgeBH = 52;
    const badgeBX = (W - badgeTW) / 2;
    const badgeBY = badgeY - badgeBH / 2;

    const badgeGrad = ctx.createLinearGradient(badgeBX, badgeBY, badgeBX + badgeTW, badgeBY);
    badgeGrad.addColorStop(0, rgba(theme.colors.primary, 0.12));
    badgeGrad.addColorStop(1, rgba(theme.colors.accent, 0.12));
    ctx.fillStyle = badgeGrad;
    roundRect(ctx, badgeBX, badgeBY, badgeTW, badgeBH, 26);
    ctx.fill();

    ctx.strokeStyle = rgba(theme.colors.primary, 0.25);
    ctx.lineWidth = 1.5;
    roundRect(ctx, badgeBX, badgeBY, badgeTW, badgeBH, 26);
    ctx.stroke();

    ctx.fillStyle = textPri;
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, W / 2, badgeY + 8);

    // "Made by" footer
    ctx.font = '400 18px system-ui, sans-serif';
    ctx.fillStyle = rgba(theme.colors.textSecondary, 0.4);
    ctx.fillText('Study Timer • by Daaku Harshit Bhardwaj', W / 2, H - 70);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todaySummary, streakInfo, totalXP, levelInfo, weeklySummaries, theme, todaySubjects, goalPercent, subjects, settings.dailyGoalHours]);

  const handleDownload = () => {
    drawCard();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study-report-${getStudyDate()}.png`;
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

    const file = new File([blob], `study-report-${getStudyDate()}.png`, { type: 'image/png' });

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'My Study Stats' });
        return;
      } catch {
        // Fall through to download
      }
    }

    handleDownload();
  };

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(drawCard, 80);
        }}
        className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-primary/20 border border-primary/30
                   text-primary text-xs sm:text-sm font-medium hover:bg-primary/30 transition-all active:scale-95"
      >
        <Share2 size={15} />
        Share
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-surface rounded-2xl border border-white/10 shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-white/5">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary">Share Daily Report</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-surface-light text-text-secondary hover:text-text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Canvas Preview */}
              <div className="px-4 sm:px-5 py-4 flex justify-center">
                <div className="w-full max-w-[260px] sm:max-w-[280px]" style={{ aspectRatio: '9/16' }}>
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full rounded-xl border border-white/5"
                  />
                </div>
              </div>

              {/* Size indicator */}
              <p className="text-center text-[10px] text-text-secondary/40 pb-1">
                {W}×{H}px • 9:16
              </p>

              {/* Actions */}
              <div className="flex gap-3 px-4 sm:px-5 py-3 sm:py-4 border-t border-white/5">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-primary text-white
                             text-sm font-semibold hover:brightness-110 transition-all active:scale-95"
                >
                  <Download size={16} />
                  Download
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl bg-surface-light border border-white/10
                             text-text-primary text-sm font-semibold hover:bg-surface-light/80 transition-all active:scale-95"
                >
                  <Share2 size={16} />
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

// Rounded rectangle path helper
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
