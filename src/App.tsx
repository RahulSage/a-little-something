import { AnimatePresence, MotionConfig, useReducedMotion } from 'motion/react';
import { memo, useEffect, useState, type CSSProperties } from 'react';
import { Atmosphere } from './components/Atmosphere';
import { BirthdayPage } from './components/BirthdayPage';
import { CountdownPage } from './components/CountdownPage';
import { MidnightReveal } from './components/MidnightReveal';
import { birthdayConfig } from './config';
import { fx, FxLayers } from './fx/Fx';
import { getBirthdayState, type Phase } from './lib/time';
import { useNow } from './lib/useNow';

const Birthday = memo(BirthdayPage);
const RAMP = 3 * 3600_000; // atmosphere builds over the last 3 hours

/** Hold the splash until fonts are in (max ~1.2s) so nothing reflows mid-entrance. */
function useReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const minDelay = new Promise((r) => setTimeout(r, Math.max(0, 650 - performance.now())));
    const fonts = Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1200))]);
    Promise.all([minDelay, fonts]).then(() => {
      if (!alive) return;
      const splash = document.getElementById('splash');
      splash?.classList.add('splash-out');
      setTimeout(() => splash?.remove(), 700);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

export default function App() {
  const now = useNow();
  const state = getBirthdayState(now, birthdayConfig);
  const reduced = useReducedMotion() ?? false;
  const ready = useReady();
  const [view, setView] = useState(state.mode);
  const [revealing, setRevealing] = useState(false);

  // Mode flips live (no refresh needed). Midnight on the 6th gets the reveal.
  useEffect(() => {
    if (state.mode === view) return;
    if (state.mode === 'birthday' && ready && !reduced) {
      setRevealing(true);
      const t = setTimeout(() => setView('birthday'), 600);
      return () => clearTimeout(t);
    }
    setView(state.mode);
  }, [state.mode, view, ready, reduced]);

  const countdown = state.mode === 'countdown' ? state : null;
  const intensity = view === 'birthday' ? 1 : countdown?.phase === 'eve' ? Math.max(0, 1 - countdown.remaining / RAMP) : 0;
  const level = Math.round(intensity * 10);

  // Ambient particles: denser and with hearts as midnight approaches; calmer afterwards.
  useEffect(() => {
    const base = innerWidth < 640 ? 18 : 30;
    if (reduced) return fx.back?.setAmbient(8, 0, true);
    if (view === 'birthday') return fx.back?.setAmbient(base * 1.5, 0.006);
    fx.back?.setAmbient(Math.round(base * (1 + level * 0.12)), level * 0.0005);
  }, [view, level, reduced]);

  // Warm the image cache on the eve so the midnight reveal never waits on the network.
  const eve = countdown?.phase === 'eve';
  useEffect(() => {
    if (!eve) return;
    const P = birthdayConfig.photos;
    for (const src of [P.crown.src, P.secretBadge.src, P.sittingSticker.src, P.walkingSticker.src, ...P.gallery.map((g) => g.src)]) {
      new Image().src = src;
    }
  }, [eve]);

  // Tiny hearts/sparkles near the cursor (desktop) or around taps (touch).
  useEffect(() => {
    if (reduced) return;
    let last = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.timeStamp - last < 90) return;
      last = e.timeStamp;
      if (Math.random() < 0.3) fx.front?.trail(e.clientX, e.clientY);
    };
    const tap = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return;
      for (let i = 0; i < 3; i++) fx.front?.trail(e.clientX, e.clientY, i === 0);
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', tap, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', tap);
    };
  }, [reduced]);

  // While the reveal plays the countdown is frozen at 00:00:00.
  const parts = countdown?.parts ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const phase: Phase = countdown?.phase ?? 'eve';

  return (
    <MotionConfig reducedMotion="user">
      <Atmosphere birthday={view === 'birthday'} intensity={intensity} />
      <FxLayers />
      <main className="main" style={{ '--intensity': intensity } as CSSProperties}>
        {ready && (
          <AnimatePresence mode="wait">
            {view === 'birthday' ? (
              <Birthday key="birthday" />
            ) : (
              <CountdownPage key="countdown" parts={parts} phase={phase} remaining={countdown?.remaining ?? 0} />
            )}
          </AnimatePresence>
        )}
      </main>
      <AnimatePresence>{revealing && <MidnightReveal onDone={() => setRevealing(false)} />}</AnimatePresence>
    </MotionConfig>
  );
}
