import { StructuredPrompt, ObjectDescription } from '@/lib/bria/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
    candidates?: {
        content: {
            parts: { text: string }[];
        };
    }[];
}

/**
 * Call Gemini API directly
 */
async function callGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${error}`);
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error('No response from Gemini');
    }

    return text;
}

/**
 * Extract JSON from Gemini response (handles markdown code blocks)
 */
function extractJson(text: string): string {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }
    // Otherwise return the text as-is
    return text.trim();
}

/**
 * Generate a full structured prompt from a natural language description
 */
export async function generateStructuredPromptFromDescription(
    description: string
): Promise<StructuredPrompt> {
    const prompt = `You are an expert visual AI that converts natural language descriptions into structured JSON prompts for image generation.

Given the following description, create a detailed structured prompt JSON that captures:
- Objects in the scene with their descriptions, locations, relationships, sizes, colors, textures
- Background setting
- Lighting conditions, direction, and shadows
- Aesthetics including composition, color scheme, and mood
- Photographic characteristics like depth of field, focus, camera angle, lens focal length
- Style medium and artistic style

Description: "${description}"

Return ONLY valid JSON matching this exact structure (no markdown, no explanation):
{
    "short_description": "brief scene description",
    "objects": [
        {
            "description": "main subject description",
            "location": "position in frame (e.g., center, left foreground)",
            "relationship": "relationship to other elements (e.g., primary subject, background element)",
            "relative_size": "size relative to frame (e.g., medium, large, small)",
            "shape_and_color": "shape and primary colors",
            "texture": "surface texture",
            "appearance_details": "additional visual details"
        }
    ],
    "background_setting": "environment description",
    "lighting": {
        "conditions": "lighting type (e.g., natural daylight, studio, golden hour)",
        "direction": "light direction (e.g., from above, side lit, backlit)",
        "shadows": "shadow characteristics"
    },
    "aesthetics": {
        "composition": "composition style (e.g., rule of thirds, centered, symmetrical)",
        "color_scheme": "color palette description",
        "mood_atmosphere": "emotional tone and atmosphere"
    },
    "photographic_characteristics": {
        "depth_of_field": "DOF setting (e.g., shallow, deep, medium)",
        "focus": "focus description (e.g., sharp on subject, soft background)",
        "camera_angle": "camera angle (e.g., eye level, low angle, bird's eye)",
        "lens_focal_length": "lens type (e.g., 50mm, 85mm portrait, 24mm wide)"
    },
    "style_medium": "visual style (e.g., photography, digital art, illustration)",
    "context": "usage context",
    "artistic_style": "artistic style reference"
}`;

    const response = await callGemini(prompt);
    const jsonStr = extractJson(response);

    try {
        return JSON.parse(jsonStr) as StructuredPrompt;
    } catch (e) {
        throw new Error(`Failed to parse Gemini response as JSON: ${jsonStr.substring(0, 200)}`);
    }
}

/**
 * Enhance an existing structured prompt with better descriptions
 */
export async function enhanceStructuredPrompt(
    currentPrompt: StructuredPrompt
): Promise<StructuredPrompt> {
    const prompt = `You are an expert visual AI. Enhance this structured prompt with more vivid, detailed descriptions while preserving the original intent.

Current prompt:
${JSON.stringify(currentPrompt, null, 2)}

Enhance each field with:
- More specific visual details
- Professional photography terminology
- Richer color and texture descriptions
- Better composition suggestions

Return ONLY the enhanced JSON (no markdown, no explanation), keeping the exact same structure.`;

    const response = await callGemini(prompt);
    const jsonStr = extractJson(response);

    try {
        return JSON.parse(jsonStr) as StructuredPrompt;
    } catch (e) {
        throw new Error('Failed to parse enhanced prompt');
    }
}

/**
 * Apply a natural language edit to the structured prompt
 */
export async function applyNaturalLanguageEdit(
    currentPrompt: StructuredPrompt,
    userInstruction: string
): Promise<StructuredPrompt> {
    const prompt = `You are an expert visual AI. Apply this user's edit request to the structured prompt.

Current prompt:
${JSON.stringify(currentPrompt, null, 2)}

User's edit request: "${userInstruction}"

Apply the requested changes while preserving all other aspects of the prompt.
Return ONLY the modified JSON (no markdown, no explanation), keeping the exact same structure.`;

    const response = await callGemini(prompt);
    const jsonStr = extractJson(response);

    try {
        return JSON.parse(jsonStr) as StructuredPrompt;
    } catch (e) {
        throw new Error('Failed to apply edit');
    }
}

/**
 * Generate human-readable labels and descriptions for UI display
 */
export interface HumanizedPrompt {
    title: string;
    summary: string;
    objects: {
        label: string;
        description: string;
        editHint: string;
    }[];
    sections: {
        name: string;
        icon: string;
        fields: {
            label: string;
            value: string;
            editHint: string;
        }[];
    }[];
}

export async function humanizePromptForUI(
    prompt: StructuredPrompt
): Promise<HumanizedPrompt> {
    const systemPrompt = `You are a UX expert that makes technical JSON understandable to non-technical users.

Given this structured prompt for image generation:
${JSON.stringify(prompt, null, 2)}

Create a human-friendly version with:
1. A catchy title (3-5 words)
2. A brief summary (1 sentence)
3. For each object: a simple label, plain English description, and hint for editing
4. Grouped sections with friendly names and icons (use emoji)

Return ONLY valid JSON in this exact format:
{
    "title": "Catchy Title Here",
    "summary": "One sentence describing the overall scene.",
    "objects": [
        {
            "label": "Main Subject",
            "description": "Plain English description of what this is",
            "editHint": "Try changing this to another subject"
        }
    ],
    "sections": [
        {
            "name": "Lighting",
            "icon": "💡",
            "fields": [
                {
                    "label": "Light Type",
                    "value": "current value in plain English",
                    "editHint": "suggestion for editing"
                }
            ]
        }
    ]
}`;

    const response = await callGemini(systemPrompt);
    const jsonStr = extractJson(response);

    try {
        return JSON.parse(jsonStr) as HumanizedPrompt;
    } catch (e) {
        // Return a fallback if parsing fails
        return {
            title: prompt.short_description || 'Visual DNA',
            summary: prompt.context || 'Extracted visual style',
            objects: prompt.objects?.map((obj, i) => ({
                label: `Object ${i + 1}`,
                description: obj.description,
                editHint: 'Change the description to modify this element'
            })) || [],
            sections: [
                {
                    name: 'Lighting',
                    icon: '💡',
                    fields: [
                        { label: 'Conditions', value: prompt.lighting?.conditions || 'Not specified', editHint: 'Try: natural, studio, dramatic' },
                        { label: 'Direction', value: prompt.lighting?.direction || 'Not specified', editHint: 'Try: front, side, backlit' },
                    ]
                },
                {
                    name: 'Camera',
                    icon: '📷',
                    fields: [
                        { label: 'Angle', value: prompt.photographic_characteristics?.camera_angle || 'Not specified', editHint: 'Try: eye level, low angle, overhead' },
                        { label: 'Lens', value: prompt.photographic_characteristics?.lens_focal_length || 'Not specified', editHint: 'Try: 35mm wide, 85mm portrait' },
                    ]
                },
                {
                    name: 'Style',
                    icon: '🎨',
                    fields: [
                        { label: 'Medium', value: prompt.style_medium || 'Not specified', editHint: 'Try: photography, illustration, 3D render' },
                        { label: 'Mood', value: prompt.aesthetics?.mood_atmosphere || 'Not specified', editHint: 'Try: dramatic, peaceful, energetic' },
                    ]
                }
            ]
        };
    }
}
