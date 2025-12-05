'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] w-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-slate-900/50 rounded-xl border border-slate-800">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                        <p className="text-slate-400 max-w-md mx-auto">
                            {this.state.error?.message || 'An unexpected error occurred while rendering this component.'}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        variant="secondary"
                        className="bg-slate-800 hover:bg-slate-700 text-white"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reload Page
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
