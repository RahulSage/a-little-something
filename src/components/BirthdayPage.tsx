import { motion } from 'motion/react';
import { useEffect } from 'react';
import { birthdayConfig as cfg } from '../config';
import { celebrate } from '../fx/Fx';
import { Footer } from './Footer';
import { Gallery } from './Gallery';
import { Heart } from './Heart';
import { inView, rise, stagger } from './motion';
import { OneMoreThing } from './OneMoreThing';
import { Wish } from './Wish';

const P = cfg.photos;

export function BirthdayPage() {
  useEffect(() => {
    const t = setTimeout(() => celebrate(true), 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div className="page" exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.5 } }}>
      <motion.section className="hero" variants={stagger} initial="hidden" animate="show">
        <motion.div variants={rise} className="crown">
          <img {...P.crown} fetchPriority="high" />
        </motion.div>
        <motion.p variants={rise} className="eyebrow">
          {cfg.dateLabel}
        </motion.p>
        <h1 className="bday-title">
          <motion.span variants={rise} className="bday-hb">
            {cfg.birthday.title}
          </motion.span>
          <motion.span variants={rise} className="bday-name">
            {cfg.name}
            <Heart className="bday-heart" />
          </motion.span>
        </h1>
        <motion.p variants={rise} className="subline">
          {cfg.birthday.subline}
        </motion.p>
        <motion.a variants={rise} href="#letter" className="scroll-cue">
          {cfg.birthday.scrollCue}
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.a>
      </motion.section>

      <section id="letter" className="section" aria-label="A message for you">
        <motion.article className="glass letter" {...inView}>
          <img className="perch" {...P.sittingSticker} aria-hidden="true" loading="lazy" />
          <p className="letter-greeting">{cfg.messageGreeting}</p>
          {cfg.personalMessage.split(/\n\s*\n/).map((p, i) => (
            <p key={i} className="letter-body">
              {p.trim()}
            </p>
          ))}
          <p className="letter-sign">{cfg.messageSignoff}</p>
        </motion.article>
      </section>

      <section className="section" aria-label={P.galleryTitle}>
        <Gallery />
      </section>

      <section className="section section-tight" aria-label="One more thing">
        <OneMoreThing />
      </section>

      <section className="section section-tight" aria-label="Make a wish">
        <Wish />
      </section>

      <motion.section className="ending" {...inView} aria-label="Ending">
        <img className="walker" {...P.walkingSticker} aria-hidden="true" loading="lazy" />
        <p className="ending-line">{cfg.endingLine}</p>
      </motion.section>

      <Footer />
    </motion.div>
  );
}
