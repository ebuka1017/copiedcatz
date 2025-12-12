import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-red-950/50 border border-red-800 rounded-2xl">
            <div className="w-12 h-12 bg-red-900/50 rounded-xl flex items-center justify-center text-red-400">
                <AlertTriangle size={24} />
            </div>
            <div className="space-y-2 max-w-md">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                {/* WCAG AA compliant: text-red-200 on dark bg provides 7:1+ contrast */}
                <p className="text-sm text-red-200">{message}</p>
            </div>
            {onRetry && (
                <div className="pt-2">
                    <Button onClick={onRetry} variant="secondary" className="bg-red-900/50 hover:bg-red-800/50 border-red-700 text-red-100 hover:text-white">
                        <RefreshCw size={16} className="mr-2" />
                        Try Again
                    </Button>
                </div>
            )}
        </div>
    );
}
