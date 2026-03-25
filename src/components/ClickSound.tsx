"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * ClickSound — Subtle, pleasant click feedback using Web Audio API.
 * No external audio files needed. Generates a short, soft "pop" sound
 * on every mouse click. Light and non-intrusive.
 */
export function ClickSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    // Resume if suspended (browsers require user interaction first)
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playClick = useCallback(() => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      // --- Soft "bubble tap" — premium, musical feel ---

      // Master gain (keeps overall volume subtle)
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.12, now);
      master.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      master.connect(ctx.destination);

      // Layer 1: Warm sine tap (G6 — 1568Hz → drops)
      const tap1 = ctx.createOscillator();
      const tap1Gain = ctx.createGain();
      tap1.type = "sine";
      tap1.frequency.setValueAtTime(1568, now);
      tap1.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      tap1Gain.gain.setValueAtTime(1, now);
      tap1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      tap1.connect(tap1Gain);
      tap1Gain.connect(master);
      tap1.start(now);
      tap1.stop(now + 0.06);

      // Layer 2: Bright harmonic (C7 — 2093Hz, very quiet)
      const tap2 = ctx.createOscillator();
      const tap2Gain = ctx.createGain();
      tap2.type = "sine";
      tap2.frequency.setValueAtTime(2093, now);
      tap2.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
      tap2Gain.gain.setValueAtTime(0.4, now);
      tap2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      tap2.connect(tap2Gain);
      tap2Gain.connect(master);
      tap2.start(now);
      tap2.stop(now + 0.04);
    } catch {
      // Silently fail — audio is non-critical
    }
  }, [getAudioContext]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Only play for actual interactive clicks (links, buttons, etc.)
      const target = e.target as HTMLElement;
      const interactive = target.closest(
        "a, button, [role='button'], input[type='checkbox'], input[type='radio'], [data-click-sound]"
      );
      if (interactive) {
        playClick();
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [playClick]);

  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      audioCtxRef.current?.close();
    };
  }, []);

  return null; // No visual output
}
