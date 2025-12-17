'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Circle, AlertCircle, Sparkles } from 'lucide-react';

interface ExtractionProgressProps {
    progress: number;
    currentCategory: string;
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
}

const STEPS = [
    { key: 'upload', label: 'Uploading image' },
    { key: 'analyze', label: 'Analyzing with FIBO' },
    { key: 'extract', label: 'Extracting Visual DNA' },
    { key: 'convert', label: 'Converting to JSON' },
    { key: 'save', label: 'Saving template' },
];

export function ExtractionProgress({
    progress,
    currentCategory,
    status
}: ExtractionProgressProps) {

    const getCurrentStep = () => {
        if (progress < 15) return 0;
        if (progress < 40) return 1;
        if (progress < 70) return 2;
        if (progress < 90) return 3;
        return 4;
    };

    const currentStep = getCurrentStep();

    return (
        <div className="w-full max-w-sm mx-auto">
            {/* Animated Icon */}
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20" />
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">
                    {status === 'uploading' && 'Uploading...'}
                    {status === 'processing' && 'Extracting Visual DNA'}
                    {status === 'completed' && 'Complete!'}
                    {status === 'error' && 'Error'}
                </h3>
                <p className="text-sm text-slate-400">
                    {currentCategory || 'Please wait...'}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-6">
                <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Progress Percentage */}
            <div className="text-center mb-6">
                <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
            </div>

            {/* Steps */}
            <div className="space-y-3">
                {STEPS.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isPending = index > currentStep;

                    return (
                        <div key={step.key} className="flex items-center gap-3">
                            {isCompleted && (
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                            )}
                            {isCurrent && (
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                            )}
                            {isPending && (
                                <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                            )}

                            <span className={`text-sm ${
                                isCurrent ? 'font-medium text-blue-400' :
                                isCompleted ? 'text-slate-300' :
                                'text-slate-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {status === 'error' && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">Something went wrong. Please try again.</span>
                </div>
            )}
        </div>
    );
}
