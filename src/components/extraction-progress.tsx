'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import styles from './ui/glass-card.module.css';

interface ExtractionProgressProps {
    progress: number;
    currentCategory: string;
    status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
}

const CATEGORIES = [
    'scene',
    'lighting',
    'camera',
    'composition',
    'color',
    'style',
    'technical',
];

export function ExtractionProgress({
    progress,
    currentCategory,
    status
}: ExtractionProgressProps) {

    const getCategoryStatus = (category: string) => {
        if (status === 'completed') return 'completed';
        if (status === 'error') return 'pending';

        const currentIndex = CATEGORIES.indexOf(currentCategory);
        const categoryIndex = CATEGORIES.indexOf(category);

        if (categoryIndex < currentIndex) return 'completed';
        if (categoryIndex === currentIndex) return 'processing';
        return 'pending';
    };

    return (
        <div className={`${styles.card} p-8 max-w-md w-full mx-auto`}>
            <div className="text-center mb-8">
                <h3 className="text-xl font-semibold mb-2">
                    {status === 'uploading' && 'Uploading Image...'}
                    {status === 'processing' && 'Extracting Visual DNA...'}
                    {status === 'completed' && 'Extraction Complete!'}
                    {status === 'error' && 'Extraction Failed'}
                </h3>
                <p className="text-sm text-slate-500">
                    {status === 'processing' && `Analyzing ${currentCategory}...`}
                    {status === 'completed' && 'Redirecting to editor...'}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-8">
                <motion.div
                    className="h-full bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Categories List */}
            <div className="space-y-3">
                {CATEGORIES.map((category) => {
                    const catStatus = getCategoryStatus(category);

                    return (
                        <div key={category} className="flex items-center gap-3">
                            {catStatus === 'completed' && (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            )}
                            {catStatus === 'processing' && (
                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                            )}
                            {catStatus === 'pending' && (
                                <Circle className="w-5 h-5 text-slate-300" />
                            )}

                            <span className={`capitalize ${catStatus === 'processing' ? 'font-medium text-blue-600' :
                                    catStatus === 'completed' ? 'text-slate-700' :
                                        'text-slate-400'
                                }`}>
                                {category}
                            </span>
                        </div>
                    );
                })}
            </div>

            {status === 'error' && (
                <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">Something went wrong. Please try again.</span>
                </div>
            )}
        </div>
    );
}
