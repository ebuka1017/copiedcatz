import React from 'react';
import Link from 'next/link';
import styles from './glass-button.module.css';
import { clsx } from 'clsx';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
    children: React.ReactNode;
    href?: string;
}

export function GlassButton({
    children,
    className,
    variant = 'primary',
    href,
    ...props
}: GlassButtonProps) {
    const buttonClass = clsx(
        styles.button,
        variant === 'secondary' && styles.secondary,
        className
    );

    if (href) {
        return (
            <Link href={href} className={buttonClass}>
                {children}
            </Link>
        );
    }

    return (
        <button
            className={buttonClass}
            {...props}
        >
            {children}
        </button>
    );
}
