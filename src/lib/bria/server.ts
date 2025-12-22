/**
 * Server-side Bria client for use in API routes
 * Uses the server-side Supabase client that can access cookies
 */
import { callEdgeFunctionServer } from '@/lib/supabase/server';
import { GenerateImageRequest, GenerateImageResponse, GenerateStructuredPromptRequest, GenerateStructuredPromptResponse } from './types';

async function pollStatusServer(statusUrl: string): Promise<any> {
    const maxAttempts = 60;
    const interval = 1000;

    for (let i = 0; i < maxAttempts; i++) {
        const data = await callEdgeFunctionServer('generate-image', {
            body: { action: 'check_status', data: { status_url: statusUrl } },
            method: 'POST'
        });

        if (data.status === 'completed') {
            return data.result || data;
        } else if (data.status === 'failed') {
            throw new Error(`Bria task failed: ${JSON.stringify(data)}`);
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('Bria task timed out');
}

export async function generateImageV2Server(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    console.log('[BriaServer] Calling edge function generate-image...');
    const data = await callEdgeFunctionServer('generate-image', {
        body: { action: 'generate_from_prompt', data: request },
        method: 'POST'
    });
    console.log('[BriaServer] Edge function response:', JSON.stringify(data).substring(0, 200));

    // If sync is requested and status_url exists, poll for result
    if (request.sync && data.status_url) {
        console.log('[BriaServer] Polling status_url...');
        return await pollStatusServer(data.status_url);
    }

    return data;
}

export async function generateStructuredPromptServer(request: GenerateStructuredPromptRequest): Promise<GenerateStructuredPromptResponse> {
    const data = await callEdgeFunctionServer('generate-image', {
        body: { action: 'generate_structured_prompt', data: request },
        method: 'POST'
    });

    if (data.status_url) {
        const result = await pollStatusServer(data.status_url);
        return result;
    }

    return data;
}
