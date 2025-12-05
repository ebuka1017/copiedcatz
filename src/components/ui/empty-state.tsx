import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
    icon: React.ElementType;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    actionOnClick?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    actionOnClick,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center space-y-6 bg-slate-900/20 border border-slate-800/50 rounded-2xl backdrop-blur-sm">
            <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center text-slate-400">
                <Icon size={32} />
            </div>
            <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="text-slate-400">{description}</p>
            </div>
            {actionLabel && (
                <div className="pt-2">
                    {actionHref ? (
                        <Button href={actionHref} variant="primary">
                            <Plus size={20} className="mr-2" />
                            {actionLabel}
                        </Button>
                    ) : (
                        <Button onClick={actionOnClick} variant="primary">
                            <Plus size={20} className="mr-2" />
                            {actionLabel}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
