// AnimatedCard.tsx
import { motion } from 'framer-motion';
import type { MotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedCardProps extends MotionProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedCard({
  children,
  className = '',
  ...motionProps
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
}
