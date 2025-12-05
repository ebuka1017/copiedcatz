import Link from 'next/link';
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({
    children,
    className,
    href,
    variant = 'primary',
    size = 'md',
    ...props
}: ButtonProps) {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const sizes = {
        sm: "h-9 px-3 text-xs",
        md: "h-10 py-2 px-4",
        lg: "h-12 px-8 text-lg",
    };

    const combinedClassName = cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
    );

    if (href) {
        return (
            <Link href={href} className={combinedClassName}>
                {children}
            </Link>
        );
    }

    return (
        <button className={combinedClassName} {...props}>
            {children}
        </button>
    );
}
