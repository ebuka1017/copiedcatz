'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { useTemplateStore } from '@/lib/stores/template-store';
import { useOptimisticGeneration } from '@/lib/hooks/use-optimistic-generation';
import Image from 'next/image';

export function Canvas() {
    const { template } = useTemplateStore();
    const optimisticState = useOptimisticGeneration();

    if (!template) return null;

    // Determine which image to show:
    // 1. Optimistic state (loading/generating)
    // 2. Latest variation
    // 3. Original image
    const latestVariation = template.variations[template.variations.length - 1];
    const displayImage = latestVariation?.image_url || template.original_image_url;

    return (
        <GlassCard className="h-full flex items-center justify-center p-8 relative overflow-hidden group">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            {/* Image Container */}
            <div className="relative w-full h-full max-w-4xl max-h-[80vh] shadow-2xl rounded-lg overflow-hidden transition-transform duration-500 ease-out">
                {displayImage ? (
                    <Image
                        src={displayImage}
                        alt="Template preview"
                        fill
                        className="object-contain"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        No image available
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
        </GlassCard>
    );
}
