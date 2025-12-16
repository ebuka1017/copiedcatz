import Link from 'next/link';
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    href?: string;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
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
    // WCAG-compliant focus states with proper contrast ratios
    const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none";

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-sm hover:shadow-md",
        secondary: "bg-slate-700 text-slate-100 hover:bg-slate-600 active:bg-slate-800 border border-slate-600 hover:border-slate-500",
        danger: "bg-red-600 text-white hover:bg-red-500 active:bg-red-700",
        ghost: "text-slate-200 hover:bg-slate-800 hover:text-white active:bg-slate-700",
    };

    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 py-2 px-4 text-sm",
        lg: "h-12 px-8 text-base",
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
