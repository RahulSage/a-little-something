import { motion } from 'motion/react';
import { birthdayConfig as cfg } from '../config';
import type { Duration } from '../lib/time';
import { easeOut } from './motion';

/** Re-keyed on change, so only the current digit exists; entrance is pure CSS (no stale frames if the tab is throttled). */
function Digit({ d }: { d: string }) {
  return (
    <span className="digit">
      <span key={d} className="digit-face">
        {d}
      </span>
    </span>
  );
}

function Unit({ value, label, lead, ring }: { value: number; label: string; lead?: boolean; ring?: boolean }) {
  const text = String(value).padStart(2, '0');
  return (
    <div className={`unit glass${lead ? ' unit-lead' : ''}`}>
      {ring && (
        <motion.span
          key={value}
          className="unit-ring"
          initial={{ opacity: 0.8, scale: 0.97 }}
          animate={{ opacity: 0, scale: 1.18 }}
          transition={{ duration: 0.95, ease: easeOut }}
        />
      )}
      <span className="unit-num">
        {text.split('').map((d, i) => (
          <Digit key={text.length - i} d={d} />
        ))}
      </span>
      <span className="unit-label">{label}</span>
    </div>
  );
}

export function Countdown({ parts, showDays, final }: { parts: Duration; showDays: boolean; final: boolean }) {
  const L = cfg.countdown.labels;
  const spoken = `${showDays ? `${parts.days} days, ` : ''}${parts.hours} hours, ${parts.minutes} minutes and ${parts.seconds} seconds to go`;
  return (
    <div className="countdown-wrap" role="timer" aria-label={spoken}>
      <div className={`countdown ${showDays ? 'cols-4' : 'cols-3'}`} aria-hidden="true">
        {showDays && <Unit value={parts.days} label={L.days} lead />}
        <Unit value={parts.hours} label={L.hours} />
        <Unit value={parts.minutes} label={L.minutes} />
        <Unit value={parts.seconds} label={L.seconds} ring={final} />
      </div>
    </div>
  );
}
