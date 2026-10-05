import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState } from 'react';
import { birthdayConfig as cfg } from '../config';
import { fx } from '../fx/Fx';
import { easeOut, inView } from './motion';

export function Wish() {
  const [wishes, setWishes] = useState(0);
  const lastBurst = useRef(0);
  const btn = useRef<HTMLButtonElement>(null);

  const wish = () => {
    setWishes((n) => n + 1);
    const now = performance.now();
    if (now - lastBurst.current < 900 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    lastBurst.current = now;
    const r = btn.current!.getBoundingClientRect();
    fx.front?.burst(r.left + r.width / 2, r.top + 4, {
      count: wishes === 0 ? 46 : 22,
      angle: -Math.PI / 2,
      spread: 0.9,
      power: [5, 11],
    });
  };

  return (
    <motion.div className="cta-block" {...inView}>
      <p className="cta-prompt">{cfg.wishPrompt}</p>
      <button ref={btn} type="button" className="btn btn-glass" onClick={wish}>
        <motion.svg className="gift" viewBox="0 0 24 24" aria-hidden="true">
          <motion.g
            key={wishes}
            initial={wishes ? { y: -4, rotate: -14 } : false}
            animate={{ y: 0, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.6, bounce: 0.45 }}
            style={{ originX: '20%', originY: '100%' }}
          >
            <rect x="3.5" y="8" width="17" height="4" rx="1.2" />
            <path d="M12 8c-1.5-3-5-3.5-5-1.5S10 8 12 8c2 0 5-.5 5-1.5S13.5 5 12 8z" />
          </motion.g>
          <rect x="5" y="12" width="14" height="8.5" rx="1.4" />
          <path d="M12 8v12.5" />
        </motion.svg>
        <span>{wishes ? cfg.wishAgain : cfg.wishButton}</span>
      </button>
      <p className="wish-result" aria-live="polite">
        <AnimatePresence mode="wait">
          {wishes > 0 && (
            <motion.span
              key={wishes}
              initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.6, ease: easeOut }}
            >
              {cfg.wishSent}
            </motion.span>
          )}
        </AnimatePresence>
      </p>
    </motion.div>
  );
}
