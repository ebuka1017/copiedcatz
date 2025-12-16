import { NextRequest, NextResponse } from 'next/server';
import {
    generateStructuredPromptFromDescription,
    enhanceStructuredPrompt,
    applyNaturalLanguageEdit,
    humanizePromptForUI,
} from '@/lib/gemini/client';
import { StructuredPrompt } from '@/lib/bria/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        if (!action) {
            return NextResponse.json({ error: 'Missing action' }, { status: 400 });
        }

        let result;

        switch (action) {
            case 'generate_from_description':
                if (!data?.description) {
                    return NextResponse.json({ error: 'Missing description' }, { status: 400 });
                }
                result = await generateStructuredPromptFromDescription(data.description);
                break;

            case 'enhance':
                if (!data?.prompt) {
                    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
                }
                result = await enhanceStructuredPrompt(data.prompt as StructuredPrompt);
                break;

            case 'natural_edit':
                if (!data?.prompt || !data?.instruction) {
                    return NextResponse.json({ error: 'Missing prompt or instruction' }, { status: 400 });
                }
                result = await applyNaturalLanguageEdit(
                    data.prompt as StructuredPrompt,
                    data.instruction
                );
                break;

            case 'humanize':
                if (!data?.prompt) {
                    return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
                }
                result = await humanizePromptForUI(data.prompt as StructuredPrompt);
                break;

            default:
                return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
        }

        return NextResponse.json({ result });
    } catch (error: any) {
        console.error('Gemini API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
