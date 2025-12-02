import { clsx } from 'clsx';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={clsx(
                'animate-pulse rounded-lg bg-slate-800/50',
                className
            )}
            {...props}
        />
    );
}
