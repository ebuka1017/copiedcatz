import { GenerateImageRequest, GenerateImageResponse, GenerateStructuredPromptRequest, GenerateStructuredPromptResponse } from './types';

const BRIA_API_URL = 'https://engine.prod.bria-api.com/v2';
const BRIA_API_TOKEN = process.env.BRIA_API_TOKEN || process.env.BRIA_API_KEY;

if (!BRIA_API_TOKEN) {
    console.warn('BRIA_API_TOKEN (or BRIA_API_KEY) is not defined. Bria API calls will fail.');
}

async function pollStatus(statusUrl: string): Promise<any> {
    const maxAttempts = 60; // 1 minute timeout roughly
    const interval = 1000; // 1 second

    for (let i = 0; i < maxAttempts; i++) {
        const response = await fetch(statusUrl, {
            headers: {
                'api_token': BRIA_API_TOKEN!,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to poll status: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.status === 'completed') {
            return data; // The result is usually nested or merged here, need to check docs carefully. 
            // Docs say "Use the Status Service to track the request's progress until it reaches a completed state."
            // Usually the result is in the `result` field of the completed status response.
            return data;
        } else if (data.status === 'failed') {
            throw new Error(`Bria task failed: ${JSON.stringify(data)}`);
        }

        await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('Bria task timed out');
}

export async function generateImageV2(request: GenerateImageRequest): Promise<GenerateImageResponse> {
    if (!BRIA_API_TOKEN) throw new Error('BRIA_API_TOKEN is missing');

    const response = await fetch(`${BRIA_API_URL}/image/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api_token': BRIA_API_TOKEN,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bria API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // If sync is requested (custom flag) or if we want to auto-poll
    if (request.sync && data.status_url) {
        return await pollStatus(data.status_url);
    }

    return data;
}

export async function generateStructuredPrompt(request: GenerateStructuredPromptRequest): Promise<GenerateStructuredPromptResponse> {
    if (!BRIA_API_TOKEN) throw new Error('BRIA_API_TOKEN is missing');

    const response = await fetch(`${BRIA_API_URL}/structured_prompt/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api_token': BRIA_API_TOKEN,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Bria API error: ${response.status} - ${errorText}`);
    }

    // Structured prompt generation might also be async? Docs say "It only returns the JSON string". 
    // But the overview says "Bria API v2 endpoints process requests asynchronously by default."
    // Let's assume it might return a status_url too.
    const data = await response.json();

    if (data.status_url) {
        const result = await pollStatus(data.status_url);
        // The result of structured prompt gen should be the structured prompt itself.
        // We might need to extract it from the result.
        return result;
    }

    return data;
}
