import { useState, useEffect, useCallback } from 'react';
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

    const { setTemplate } = useTemplateStore();

    const startExtraction = useCallback(async (blobId: string) => {
        try {
            setStatus('processing');
            setProgress(0);

            // 1. Trigger extraction job
            const response = await fetch('/api/extract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blob_id: blobId }),
            });

            if (!response.ok) {
                throw new Error('Failed to start extraction');
            }

            const data = await response.json();
            const { job_id, status: initialStatus, template_id } = data;

            // Handle synchronous completion (Bria V2)
            if (initialStatus === 'COMPLETED' && template_id) {
                setStatus('completed');
                setProgress(100);
                // We need to fetch the template? Or just navigate.
                // onComplete expects templateId.
                // The store update is missing if we skip Pusher!
                // We must fetch the template details or let `editor/[id]` page load it.
                // The `onComplete` in `UploadModal` navigates to `/editor/${templateId}`.
                // The Editor page loads the template by ID.
                // So we don't strictly need to update the store here, as the page nav will do it.
                onComplete?.(template_id);
                return;
            }

            if (initialStatus === 'FAILED') {
                throw new Error(data.error || 'Extraction failed');
            }

            // 2. Subscribe to private Pusher channel
            const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
                authEndpoint: '/api/pusher/auth',
            });

            const channel = pusher.subscribe(`private-job-${job_id}`);

            // 3. Bind events
            channel.bind('category-complete', (data: any) => {
                setProgress(data.progress);
                setCurrentCategory(data.category);
                // Optionally update partial template state here
            });

            channel.bind('complete', (data: any) => {
                setStatus('completed');
                setProgress(100);

                // Update global store
                setTemplate({
                    id: data.template_id,
                    user_id: '', // Will be filled by backend or context
                    name: 'Untitled Template',
                    original_image_url: '', // Will be filled
                    structured_prompt: data.structured_prompt,
                    variations: [],
                    folder_id: null,
                    is_public: false,
                    tags: [],
                    created_at: new Date(),
                    updated_at: new Date(),
                });

                pusher.unsubscribe(`private-job-${job_id}`);
                onComplete?.(data.template_id);
            });

            channel.bind('error', (data: any) => {
                setStatus('error');
                const error = new Error(data.message || 'Extraction failed');
                onError?.(error);
                pusher.unsubscribe(`private-job-${job_id}`);
            });

            return () => {
                pusher.unsubscribe(`private-job-${job_id}`);
            };

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
