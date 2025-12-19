'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { callEdgeFunction, createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface ExtractionProgressEvent {
    status: 'processing' | 'completed' | 'failed';
    progress: number;
    step: string;
    templateId?: string;
}

interface UseExtractionProps {
    onComplete?: (templateId: string) => void;
    onError?: (error: Error) => void;
}

export function useExtraction({ onComplete, onError }: UseExtractionProps = {}) {
    const { user } = useAuth();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
    const [currentCategory, setCurrentCategory] = useState<string>('');
    const channelRef = useRef<RealtimeChannel | null>(null);

    // Subscribe to Supabase Realtime when user is available and extraction starts
    useEffect(() => {
        if (!user || status === 'idle') return;

        const supabase = createClient();
        const channelName = `extraction-${user.id}`;

        // Subscribe to the broadcast channel
        const channel = supabase.channel(channelName);

        channel
            .on('broadcast', { event: 'extraction-progress' }, ({ payload }) => {
                const data = payload as ExtractionProgressEvent;

                setProgress(data.progress);
                setCurrentCategory(data.step);

                if (data.status === 'completed' && data.templateId) {
                    setStatus('completed');
                    setProgress(100);
                    onComplete?.(data.templateId);
                } else if (data.status === 'failed') {
                    setStatus('error');
                    onError?.(new Error('Extraction failed'));
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('Subscribed to extraction updates');
                }
            });

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
            channelRef.current = null;
        };
    }, [user, status, onComplete, onError]);

    const startExtraction = useCallback(async (blobId: string) => {
        try {
            setStatus('processing');
            setProgress(5);
            setCurrentCategory('Starting extraction...');

            const data = await callEdgeFunction('extract-template', {
                body: { blob_id: blobId },
                method: 'POST'
            });

            const { status: initialStatus, template_id, error } = data;

            // If the edge function returns immediately with completed status
            if (initialStatus === 'COMPLETED' && template_id) {
                setStatus('completed');
                setProgress(100);
                setCurrentCategory('Extraction complete!');
                onComplete?.(template_id);
                return;
            }

            if (initialStatus === 'FAILED') {
                throw new Error(error || 'Extraction failed');
            }

            // Otherwise, wait for Supabase Realtime events to update progress
            // The useEffect above handles the subscription

        } catch (error) {
            console.error('Extraction error:', error);
            setStatus('error');
            setCurrentCategory('Extraction failed');
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
