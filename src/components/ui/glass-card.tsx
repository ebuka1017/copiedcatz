import React from 'react';
import styles from './glass-card.module.css';
import { clsx } from 'clsx';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      {children}
    </div>
  );
}
