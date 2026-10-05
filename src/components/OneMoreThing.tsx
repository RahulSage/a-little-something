import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { birthdayConfig as cfg } from '../config';
import { Heart } from './Heart';
import { easeOut, inView } from './motion';

type Stage = 'closed' | 'open' | 'rise' | 'read';

function Envelope({ stage }: { stage: Stage }) {
  const opened = stage !== 'closed';
  return (
    <motion.div
      className="env"
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={stage === 'read' ? { opacity: 0, y: 60, scale: 0.96 } : { opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: stage === 'read' ? 0.6 : 0.5, ease: easeOut }}
    >
      <div className="env-back" />
      <motion.div
        className="env-letter"
        animate={{ y: stage === 'rise' || stage === 'read' ? '-48%' : '0%' }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      >
        <span className="env-letter-line" />
        <span className="env-letter-line short" />
      </motion.div>
      <div className="env-pocket" />
      <motion.div
        className="env-flap"
        style={{ zIndex: opened ? 1 : 4 }}
        animate={{ rotateX: opened ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.77, 0, 0.175, 1] }}
      />
      <motion.span className="env-seal" animate={{ opacity: opened ? 0 : 1, scale: opened ? 0.8 : 1 }} transition={{ duration: 0.25 }}>
        <Heart />
      </motion.span>
    </motion.div>
  );
}

function Dialog({ onClose }: { onClose: () => void }) {
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduced ? 'read' : 'closed');
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (reduced) return;
    const ts = [setTimeout(() => setStage('open'), 550), setTimeout(() => setStage('rise'), 1200), setTimeout(() => setStage('read'), 2050)];
    return () => ts.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        e.preventDefault(); // the close button is the only control inside
        closeBtn.current?.focus();
      }
    };
    const html = document.documentElement;
    html.classList.add('locked');
    window.addEventListener('keydown', onKey);
    return () => {
      html.classList.remove('locked');
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-label={cfg.secretButton}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.45 }}
      onClick={onClose}
    >
      <div className="modal-stage" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence>{stage !== 'read' && <Envelope key="env" stage={stage} />}</AnimatePresence>
        <AnimatePresence>
          {stage === 'read' && (
            <motion.div
              key="note"
              className="note-card"
              initial={{ opacity: 0, y: 28, scale: 0.96, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, ease: easeOut }}
            >
              <motion.img
                className="note-badge"
                {...cfg.photos.secretBadge}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.9, ease: easeOut }}
              />
              <motion.p
                className="note-hand"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.9, ease: easeOut }}
              >
                {cfg.secretMessage}
              </motion.p>
              <motion.p
                className="note-follow"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.9, ease: easeOut }}
              >
                {cfg.secretFollowUp}
              </motion.p>
              <motion.span
                className="note-heart"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.4, duration: 0.6, ease: easeOut }}
              >
                <Heart />
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
        <button ref={closeBtn} type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

export function OneMoreThing() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);

  return (
    <motion.div className="cta-block" {...inView}>
      <p className="cta-prompt">{cfg.secretPrompt}</p>
      <button ref={trigger} type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
        {cfg.secretButton}
      </button>
      {createPortal(<AnimatePresence>{open && <Dialog onClose={close} />}</AnimatePresence>, document.body)}
    </motion.div>
  );
}
