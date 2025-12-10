import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Pusher from 'pusher-js';
import { useTemplateStore } from '@/lib/stores/template-store';

interface UseExtractionProps {
    onComplete?: (templateId: string) => void;
    onError?: (error: Error) => void;
}

export function useExtraction({ onComplete, onError }: UseExtractionProps = {}) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
    const [currentCategory, setCurrentCategory] = useState<string>('');
    const supabase = createClient();

    const { setTemplate } = useTemplateStore();

    const startExtraction = useCallback(async (blobId: string) => {
        try {
            setStatus('processing');
            setProgress(0);

            const { data, error } = await supabase.functions.invoke('extract-template', {
                body: { blob_id: blobId }
            });

            if (error) {
                throw new Error(error.message || 'Failed to start extraction');
            }

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
    }, [onComplete, onError, setTemplate]);

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
