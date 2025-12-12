import { useState, useCallback } from 'react';
import { callEdgeFunction } from '@/lib/supabase/client';

interface UseExtractionProps {
    onComplete?: (templateId: string) => void;
    onError?: (error: Error) => void;
}

export function useExtraction({ onComplete, onError }: UseExtractionProps = {}) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
    const [currentCategory, setCurrentCategory] = useState<string>('');

    const startExtraction = useCallback(async (blobId: string) => {
        try {
            setStatus('processing');
            setProgress(0);

            const data = await callEdgeFunction('extract-template', {
                body: { blob_id: blobId },
                method: 'POST'
            });

            const { job_id, status: initialStatus, template_id } = data;

            if (initialStatus === 'COMPLETED' && template_id) {
                setStatus('completed');
                setProgress(100);
                onComplete?.(template_id);
                return;
            }

            if (initialStatus === 'FAILED') {
                throw new Error(data.error || 'Extraction failed');
            }

        } catch (error) {
            console.error('Extraction error:', error);
            setStatus('error');
            onError?.(error instanceof Error ? error : new Error('Unknown error'));
        }
    }, [onComplete, onError]);

    const reset = useCallback(() => {
        setStatus('idle');
        setProgress(0);
        setCurrentCategory('');
    }, []);

    return {
        startExtraction,
        progress,
        status,
        currentCategory,
        reset,
    };
}
