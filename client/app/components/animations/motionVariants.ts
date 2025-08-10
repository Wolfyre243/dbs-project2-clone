import type { Variants } from 'framer-motion';

export const fadeUpContainer: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05 * i,
    },
  }),
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.12, 0.24, 0.9] },
  },
};

export const marqueeCard: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  hover: {
    y: -4,
    scale: 1.03,
    transition: { type: 'spring', stiffness: 260, damping: 18 },
  },
};

export const formReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

export const tapPulse = {
  whileHover: { scale: 1.15, rotate: -3 },
  whileTap: { scale: 0.85, rotate: 3 },
};
