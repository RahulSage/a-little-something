import { useEffect, useState } from 'react';

/**
 * Preview any moment with `?now=2026-10-05T23:59:55+05:30` — the clock then
 * runs forward from there in real time. (A `+` in a URL arrives as a space.)
 */
function mockOffset(): number {
  const raw = new URLSearchParams(location.search).get('now');
  const t = raw ? Date.parse(raw.replace(' ', '+')) : NaN;
  return Number.isNaN(t) ? 0 : t - Date.now();
}

const offset = typeof location === 'undefined' ? 0 : mockOffset();
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
