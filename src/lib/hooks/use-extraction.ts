'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { callEdgeFunction } from '@/lib/supabase/client';
import { subscribeToPusherChannel, unsubscribeFromPusherChannel } from '@/lib/pusher-client';
import { useAuth } from '@/lib/hooks/use-auth';

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
    const channelRef = useRef<ReturnType<typeof subscribeToPusherChannel> | null>(null);

    // Subscribe to Pusher events when user is available and extraction starts
    useEffect(() => {
        if (!user || status === 'idle') return;

        const channelName = `user-${user.id}`;
        const channel = subscribeToPusherChannel(channelName);
        channelRef.current = channel;

        channel.bind('extraction-progress', (data: ExtractionProgressEvent) => {
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
        });

        return () => {
            channel.unbind_all();
            unsubscribeFromPusherChannel(channelName);
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
            // (happens when Pusher updates are faster than the response)
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

            // Otherwise, wait for Pusher events to update progress
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
