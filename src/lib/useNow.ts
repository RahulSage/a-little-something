import { useEffect, useState } from 'react';
import { birthdayConfig } from '../config';
import { nextBirthday } from './time';

/**
 * In `npm run dev`, preview any moment with `?now=2026-10-05T23:59:55+05:30` — the clock then
 * runs forward from there in real time. (A `+` in a URL arrives as a space.)
 */
function mockOffset(): number {
  const raw = new URLSearchParams(location.search).get('now');
  const t = raw ? Date.parse(raw.replace(' ', '+')) : NaN;
  return Number.isNaN(t) ? 0 : t - Date.now();
}

/** The `/preview/` build (vite --mode preview) opens 10 seconds before the next birthday midnight. */
function previewOffset(): number {
  const real = Date.now();
  return mockOffset() || nextBirthday(real, birthdayConfig) - 10_000 - real;
}

// The production site always follows the real clock.
const offset =
  typeof location === 'undefined' ? 0 : import.meta.env.MODE === 'preview' ? previewOffset() : import.meta.env.DEV ? mockOffset() : 0;
export const clockNow = () => Date.now() + offset;

/** Re-renders on every whole second, aligned to the wall clock. */
export function useNow(): number {
  const [now, setNow] = useState(clockNow);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const n = clockNow();
      setNow(n);
      id = window.setTimeout(tick, 1000 - (n % 1000) + 10);
    };
    // Background tabs throttle timers; resync the moment she looks again.
    const onVisible = () => {
      if (document.hidden) return;
      clearTimeout(id);
      tick();
    };
    tick();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return now;
}
