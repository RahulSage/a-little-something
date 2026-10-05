import { motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { birthdayConfig as cfg } from '../config';
import { easeOut, inView } from './motion';

const photos = cfg.photos.gallery;
const n = photos.length;
const TILT = [-3, 2.5, -1.5, 3.5, -2.5, 1.5];

/** A little stack of photo cards: swipe/tap the top one away, it tucks in at the back. */
export function Gallery() {
  const [top, setTop] = useState(0);
  const [leaving, setLeaving] = useState(0); // -1 | 0 | 1: direction the top card is being thrown
  const deck = useRef<HTMLDivElement>(null);
  const visible = useInView(deck, { margin: '-20%' });
  const reduced = useReducedMotion();

  const next = (dir = 1) => {
    if (leaving) return;
    if (reduced) setTop((t) => (t + 1) % n);
    else setLeaving(dir);
  };
  const prev = () => !leaving && setTop((t) => (t - 1 + n) % n);

  // Gentle autoplay while in view; any interaction restarts the timer (it's keyed on `top`).
  useEffect(() => {
    if (!visible || leaving) return;
    const id = setTimeout(() => next(1), 5200);
    return () => clearTimeout(id);
  }, [top, visible, leaving]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div className="gallery" {...inView}>
      <h2 className="gallery-title">{cfg.photos.galleryTitle}</h2>
      <div
        ref={deck}
        className="deck"
        role="group"
        aria-roledescription="carousel"
        aria-label={cfg.photos.galleryTitle}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') next(1);
          if (e.key === 'ArrowLeft') prev();
        }}
      >
        {photos.map((p, idx) => {
          const depth = (idx - top + n) % n;
          const isTop = depth === 0;
          const thrown = isTop && leaving !== 0;
          return (
            <motion.div
              key={p.src}
              className="card"
              style={{ zIndex: n - depth }}
              initial={false}
              animate={
                thrown
                  ? { x: `${leaving * 115}%`, y: -10, rotate: leaving * 16, opacity: 0, scale: 1 }
                  : { x: 0, y: depth * 12, rotate: isTop ? 0 : TILT[idx % TILT.length], scale: 1 - depth * 0.045, opacity: depth > 2 ? 0 : 1 }
              }
              transition={thrown ? { duration: 0.42, ease: [0.32, 0.72, 0, 1] } : { duration: 0.7, ease: easeOut }}
              onAnimationComplete={() => {
                if (thrown) {
                  setTop((t) => (t + 1) % n);
                  setLeaving(0);
                }
              }}
              drag={isTop && !leaving ? 'x' : false}
              dragSnapToOrigin
              dragElastic={0.6}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 450) next(info.offset.x > 0 ? 1 : -1);
              }}
              onTap={() => isTop && next(1)}
              aria-hidden={!isTop}
            >
              <img
                className={isTop && !reduced ? 'kb' : undefined}
                key={isTop ? `top-${top}` : 'rest'}
                src={p.src}
                alt={p.alt}
                width={960}
                height={1200}
                loading={depth < 2 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
              />
            </motion.div>
          );
        })}
      </div>
      <div className="dots">
        {photos.map((p, idx) => (
          <button
            key={p.src}
            type="button"
            className="dot"
            aria-label={`Photo ${idx + 1} of ${n}`}
            aria-current={idx === top}
            onClick={() => !leaving && setTop(idx)}
          />
        ))}
      </div>
      <p className="gallery-hint">{cfg.photos.galleryHint}</p>
    </motion.div>
  );
}
