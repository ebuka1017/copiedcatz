import { useState, useEffect } from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';

export function useOptimisticGeneration() {
    const { isGenerating } = useTemplateStore();
    const [optimisticVariation, setOptimisticVariation] = useState<string | null>(null);

    useEffect(() => {
        if (isGenerating) {
            // Show skeleton immediately
            setOptimisticVariation('generating...');
        } else {
            setOptimisticVariation(null);
        }
    }, [isGenerating]);

    return optimisticVariation;
}
