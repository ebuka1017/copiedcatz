import React from 'react';
import styles from './glass-button.module.css';
import { clsx } from 'clsx';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
}

export function GlassButton({
    children,
    className,
    variant = 'primary',
    ...props
}: GlassButtonProps) {
    return (
        <button
            className={clsx(
                styles.button,
                variant === 'secondary' && styles.secondary,
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
