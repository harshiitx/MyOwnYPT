'use client';

// ==========================================
// Timer Hook - Real-time elapsed time
// ==========================================

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';

/**
 * Returns the current elapsed time in seconds,
 * updating every second when the timer is running.
 */
export function useTimer(): number {
  const { isRunning, currentSessionStart, elapsedBeforePause } = useStore();
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && currentSessionStart) {
      const tick = () => {
        const runningTime = (Date.now() - currentSessionStart) / 1000;
        setElapsed(elapsedBeforePause + runningTime);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    } else {
      setElapsed(elapsedBeforePause);
    }
  }, [isRunning, currentSessionStart, elapsedBeforePause]);

  // Update every second for display (using setInterval for consistent 1s ticks)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (currentSessionStart) {
        const runningTime = (Date.now() - currentSessionStart) / 1000;
        setElapsed(elapsedBeforePause + runningTime);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, currentSessionStart, elapsedBeforePause]);

  return Math.floor(elapsed);
}
