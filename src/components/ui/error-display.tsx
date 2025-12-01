import React from 'react';
import { GlassButton } from '@/components/ui/glass-button';
import { Alert02Icon, RefreshIcon } from '@hugeicons/react';

interface ErrorDisplayProps {
    title?: string;
    message: string;
    onRetry?: () => void;
}

export function ErrorDisplay({
    title = "Something went wrong",
    message,
    onRetry,
}: ErrorDisplayProps) {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
                <Alert02Icon size={24} />
            </div>
            <div className="space-y-1 max-w-md">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm text-red-300/80">{message}</p>
            </div>
            {onRetry && (
                <div className="pt-2">
                    <GlassButton onClick={onRetry} variant="secondary" className="bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-200">
                        <RefreshIcon size={16} className="mr-2" />
                        Try Again
                    </GlassButton>
                </div>
            )}
        </div>
    );
}
