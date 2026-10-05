import { motion } from 'motion/react';
import { birthdayConfig as cfg } from '../config';
import type { Duration, Phase } from '../lib/time';
import { Countdown } from './Countdown';
import { Footer } from './Footer';
import { rise, stagger } from './motion';

interface Props {
  parts: Duration;
  phase: Phase;
  remaining: number;
}

export function CountdownPage({ parts, phase, remaining }: Props) {
  const copy = cfg.countdown[phase];
  return (
    <motion.div className="page" exit={{ opacity: 0, filter: 'blur(10px)', scale: 0.985, transition: { duration: 0.5 } }}>
      <motion.section className="hero" variants={stagger} initial="hidden" animate="show">
        <motion.p variants={rise} className="eyebrow">
          {cfg.dateLabel}
        </motion.p>
        <motion.p variants={rise} className="for-my">
          {cfg.forMy}
        </motion.p>
        <motion.h1 variants={rise} className="name">
          {cfg.name}
        </motion.h1>
        <motion.p variants={rise} className="phase-title">
          {copy.title}
        </motion.p>
        <motion.div variants={rise} className="w-full">
          <Countdown parts={parts} showDays={parts.days > 0} final={phase === 'eve' && remaining <= 10_000} />
        </motion.div>
        <motion.p variants={rise} className="note">
          {copy.note}
        </motion.p>
      </motion.section>
      <Footer />
    </motion.div>
  );
}
