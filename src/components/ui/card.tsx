import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function Card({ children, className, onClick, ...props }: CardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
