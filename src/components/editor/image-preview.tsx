'use client';

import React from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';
import { Download, Share2, Loader2 } from 'lucide-react';
import styles from '@/components/ui/glass-card.module.css';
import buttonStyles from '@/components/ui/glass-button.module.css';

export function ImagePreview() {
    const { template, isGenerating } = useTemplateStore();

    if (!template) return null;

    // Get latest variation or original
    const currentImage = template.variations.length > 0
        ? template.variations[template.variations.length - 1].image_url
        : template.original_image_url;

    return (
        <div className={`${styles.card} h-full flex flex-col p-4 relative overflow-hidden`}>
            <div className="flex-1 flex items-center justify-center bg-slate-900/5 rounded-xl overflow-hidden relative">
                {isGenerating && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-2" />
                        <p className="text-sm font-medium text-slate-600">Generating Variation...</p>
                    </div>
                )}

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={currentImage}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain shadow-lg rounded-lg"
                />
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-slate-500">
                    {template.variations.length > 0
                        ? `Variation #${template.variations.length}`
                        : 'Original Image'}
                </div>

                <div className="flex gap-2">
                    <button className={`${buttonStyles.button} !py-2 !px-3 !text-sm`}>
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                    <button className={`${buttonStyles.button} !py-2 !px-3 !text-sm !bg-white/50 !text-slate-700 hover:!bg-white/80`}>
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </div>
        </div>
    );
}
