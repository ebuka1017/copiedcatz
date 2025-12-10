import { createClient } from '@/lib/supabase/client';
import { GenerateImageRequest, GenerateImageResponse, GenerateStructuredPromptRequest, GenerateStructuredPromptResponse } from './types';

const supabase = createClient();

async function pollStatus(statusUrl: string): Promise<any> {
    const maxAttempts = 60; // 1 minute timeout roughly
    const interval = 1000; // 1 second

    for (let i = 0; i < maxAttempts; i++) {
        const { data, error } = await supabase.functions.invoke('generate-image', {
            body: { action: 'check_status', data: { status_url: statusUrl } }
        });

        if (error) {
            throw new Error(`Failed to poll status: ${error.message}`);
        }

        if (data.status === 'completed') {
            return data.result || data;
        } else if (data.status === 'failed') {
            throw new Error(`Bria task failed: ${JSON.stringify(data)}`);
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('Bria task timed out');
}

export async function generateImageV2(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { action: 'generate_image', data: request }
    });

    if (error) throw new Error(`generateImageV2 failed: ${error.message}`);

    // If sync is requested or if we see a status_url, we might want to poll?
    // The previous implementation polled if `request.sync` was true.
    if (request.sync && data.status_url) {
        return await pollStatus(data.status_url);
    }

    return data;
}

export async function generateStructuredPrompt(request: GenerateStructuredPromptRequest): Promise<GenerateStructuredPromptResponse> {
    const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { action: 'generate_structured_prompt', data: request }
    });

    if (error) throw new Error(`generateStructuredPrompt failed: ${error.message}`);

    if (data.status_url) {
        const result = await pollStatus(data.status_url);
        return result;
    }

    return data;
}

export async function removeBackground(imageUrl: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { action: 'remove_background', data: { image_url: imageUrl } }
    });

    if (error) throw new Error(`removeBackground failed: ${error.message}`);

    if (data.status_url) {
        const result = await pollStatus(data.status_url);
        return result.url || result.image_url || result.result_url;
    }
    return data.url || data.result_url;
}

export async function upscale(imageUrl: string, scale: 2 | 4 = 2): Promise<string> {
    const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { action: 'increase_resolution', data: { image_url: imageUrl, desired_increase: scale } }
    });

    if (error) throw new Error(`upscale failed: ${error.message}`);

    if (data.status_url) {
        const result = await pollStatus(data.status_url);
        return result.url || result.image_url || result.result_url;
    }
    return data.url || data.result_url;
}
