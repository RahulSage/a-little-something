import { motion } from 'motion/react';

/** Screen dims, then light blooms from the centre. ~2.6s total. */
export function MidnightReveal({ onDone }: { onDone: () => void }) {
  return (
    <div className="reveal" aria-hidden="true">
      <motion.div
        className="reveal-dim"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0.55, 0] }}
        transition={{ duration: 2.6, times: [0, 0.19, 0.3, 1], ease: 'easeInOut' }}
        onAnimationComplete={onDone}
      />
      <motion.div
        className="reveal-glow"
        initial={{ opacity: 0, scale: 0.15 }}
        animate={{ opacity: [0, 0, 1, 0], scale: [0.15, 0.15, 1.3, 2.2] }}
        transition={{ duration: 2.6, times: [0, 0.22, 0.48, 1], ease: [0.23, 1, 0.32, 1] }}
      />
    </div>
  );
}
