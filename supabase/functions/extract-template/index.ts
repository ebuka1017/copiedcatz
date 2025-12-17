import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Pusher from "npm:pusher"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent';

/**
 * Use Gemini to convert raw FIBO output into clean, structured JSON
 */
async function cleanWithGemini(fiboData: any, geminiApiKey: string): Promise<any> {
    const prompt = `You are an expert at converting raw AI model outputs into clean, well-structured JSON.

Given this raw Visual DNA extraction from an image analysis AI (FIBO):
${JSON.stringify(fiboData, null, 2)}

Convert this into a clean, user-friendly structured prompt JSON with this exact format:
{
    "short_description": "A brief 1-sentence description of the scene",
    "objects": [
        {
            "description": "Main subject description",
            "location": "Position in frame (center, left, right, foreground, background)",
            "relationship": "Role in scene (primary subject, secondary element, background)",
            "relative_size": "Size relative to frame (small, medium, large)",
            "shape_and_color": "Key visual characteristics",
            "texture": "Surface texture if applicable"
        }
    ],
    "background_setting": "Description of the environment/background",
    "lighting": {
        "conditions": "Type of lighting (natural, studio, dramatic, etc.)",
        "direction": "Where light comes from (front, side, backlit, etc.)",
        "shadows": "Shadow characteristics"
    },
    "aesthetics": {
        "composition": "Composition style (rule of thirds, centered, etc.)",
        "color_scheme": "Color palette description",
        "mood_atmosphere": "Emotional tone and atmosphere"
    },
    "photographic_characteristics": {
        "depth_of_field": "Shallow, medium, or deep",
        "focus": "What's in focus",
        "camera_angle": "Eye level, low angle, high angle, etc.",
        "lens_focal_length": "Wide, standard, telephoto, etc."
    },
    "style_medium": "Photography, digital art, illustration, etc.",
    "artistic_style": "Any specific artistic style reference"
}

Return ONLY valid JSON, no markdown code blocks, no explanations.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 4096,
                },
            }),
        });

        if (!response.ok) {
            console.error('Gemini API error:', await response.text());
            return fiboData; // Fallback to raw FIBO data
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return fiboData;
        }

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Gemini processing error:', error);
        return fiboData; // Fallback to raw FIBO data
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const briaApiToken = Deno.env.get('BRIA_API_TOKEN')
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
        const pusherAppId = Deno.env.get('PUSHER_APP_ID')
        const pusherKey = Deno.env.get('PUSHER_KEY')
        const pusherSecret = Deno.env.get('PUSHER_SECRET')
        const pusherCluster = Deno.env.get('PUSHER_CLUSTER')

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey || !briaApiToken) {
            throw new Error('Missing Environment Variables')
        }

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

        const pusher = new Pusher({
            appId: pusherAppId!,
            key: pusherKey!,
            secret: pusherSecret!,
            cluster: pusherCluster!,
            useTLS: true,
        });

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        let body;
        try {
            body = await req.json()
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const { blob_id } = body;
        if (!blob_id) {
            return new Response(JSON.stringify({ error: 'Missing blob_id' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Fetch Upload
        const { data: upload, error: uploadError } = await supabaseAdmin
            .from('Upload')
            .select('*')
            .eq('id', blob_id)
            .single()

        if (uploadError || !upload || upload.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Upload not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            })
        }

        const imageUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${upload.filepath}`

        // Trigger Pusher: Started
        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'processing',
            progress: 10,
            step: 'Initializing extraction...'
        });

        // Call FIBO via fal.ai to extract structured prompt from image
        // Docs: https://fal.ai/models/bria/fibo/generate
        const falApiKey = Deno.env.get('FAL_KEY') || briaApiToken;

        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'processing',
            progress: 20,
            step: 'Analyzing image with FIBO...'
        });

        const fiboRes = await fetch('https://fal.run/fal-ai/bria-fibo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${falApiKey}`,
            },
            body: JSON.stringify({
                image_url: imageUrl,
                seed: Math.floor(Math.random() * 10000),
                steps_num: 30,
                sync_mode: true,  // Wait for result
            })
        });

        if (!fiboRes.ok) {
            const errText = await fiboRes.text();
            console.error('FIBO API Error:', fiboRes.status, errText);
            throw new Error(`FIBO Error: ${fiboRes.status} - ${errText}`);
        }

        const fiboData = await fiboRes.json();

        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'processing',
            progress: 60,
            step: 'Visual DNA extracted!'
        });

        // The structured_prompt is returned in the response
        let extractedData = fiboData.structured_prompt || fiboData;

        // Process with Gemini to create clean, copyable JSON
        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'processing',
            progress: 80,
            step: 'Converting to structured JSON...'
        });

        let structuredPrompt = extractedData;
        if (geminiApiKey) {
            structuredPrompt = await cleanWithGemini(extractedData, geminiApiKey);
        }

        // Create Template with cleaned JSON
        const { data: template, error: temError } = await supabaseAdmin.from('Template')
            .insert({
                user_id: user.id,
                name: `Extraction ${new Date().toLocaleString()}`,
                original_image_url: imageUrl,
                structured_prompt: structuredPrompt,
                is_public: false,
                folder_id: null
            })
            .select()
            .single()

        if (temError) throw temError

        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'completed',
            progress: 100,
            step: 'Extraction complete!',
            templateId: template.id
        });

        return new Response(JSON.stringify({
            status: 'COMPLETED',
            template_id: template.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Func Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
