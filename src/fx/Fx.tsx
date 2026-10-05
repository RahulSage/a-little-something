import { useEffect, useRef } from 'react';
import { Engine } from './engine';

/** back: ambient motes behind content. front: confetti + pointer sparkles above it. */
export const fx: { back?: Engine; front?: Engine } = {};

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** One generous burst for the midnight reveal; small ones afterwards. */
export function celebrate(big: boolean) {
  const f = fx.front;
  if (!f || reducedMotion()) return;
  const w = innerWidth;
  const h = innerHeight;
  const k = Math.min(1, Math.max(0.5, w / 1100)); // fewer pieces on phones

  if (!big) return f.burst(w / 2, h * 0.4, { count: 40 * k, power: [3, 9] });

  f.burst(w / 2, h * 0.42, { count: 110 * k, power: [4, 12] });
  setTimeout(() => {
    fx.front?.burst(-10, h * 0.85, { count: 55 * k, angle: -Math.PI / 3, spread: 0.35, power: [12, 20] });
    fx.front?.burst(w + 10, h * 0.85, { count: 55 * k, angle: (-2 * Math.PI) / 3, spread: 0.35, power: [12, 20] });
  }, 260);
  // tiny lavender/pink fireworks
  for (let i = 0; i < 4; i++) {
    setTimeout(() => {
      fx.front?.burst(w * (0.2 + Math.random() * 0.6), h * (0.14 + Math.random() * 0.24), {
        count: 28 * k,
        kind: 'spark',
        power: [1.5, 4.5],
      });
    }, 700 + i * 520);
  }
}

export function FxLayers() {
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fx.back = new Engine(back.current!, 160);
    fx.front = new Engine(front.current!, 500);
    return () => {
      fx.back?.destroy();
      fx.front?.destroy();
      fx.back = fx.front = undefined;
    };
  }, []);

  return (
    <>
      <canvas ref={back} className="fx fx-back" aria-hidden="true" />
      <canvas ref={front} className="fx fx-front" aria-hidden="true" />
    </>
  );
}
