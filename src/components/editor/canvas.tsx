'use client';

import { Card } from '@/components/ui/card';
import { useTemplateStore } from '@/lib/stores/template-store';
import { useOptimisticGeneration } from '@/lib/hooks/use-optimistic-generation';
import { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

export function Canvas() {
    const { template } = useTemplateStore();
    const optimisticState = useOptimisticGeneration();
    const [imageError, setImageError] = useState(false);

    // Determine which image to show:
    // 1. Latest variation
    // 2. Original image
    const variations = template?.variations || [];
    const latestVariation = variations[variations.length - 1];
    const displayImage = latestVariation?.image_url || template?.original_image_url;

    // Reset error state when the displayed image changes
    useEffect(() => {
        setImageError(false);
    }, [displayImage]);

    if (!template) return null;

    return (
        <Card className="h-full flex items-center justify-center p-8 relative overflow-hidden group bg-slate-900 border-slate-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Image Container */}
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] shadow-2xl rounded-lg overflow-hidden transition-transform duration-500 ease-out">
                {displayImage && !imageError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={displayImage}
                        alt="Template preview"
                        className="w-full h-full object-contain"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <ImageOff className="w-12 h-12 opacity-50" />
                        <p className="text-sm">
                            {imageError ? 'Failed to load image' : 'No image available'}
                        </p>
                        {displayImage && (
                            <p className="text-xs text-slate-500 max-w-md truncate px-4">
                                URL: {displayImage}
                            </p>
                        )}
                    </div>
                )}

                {/* Optimistic Overlay */}
                {optimisticState && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
                            <p className="text-white font-medium">{optimisticState}</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
