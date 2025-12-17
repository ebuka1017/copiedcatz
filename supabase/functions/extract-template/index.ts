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
            return fiboData;
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return fiboData;
        }

        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
        const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Gemini processing error:', error);
        return fiboData;
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

        // Call Bria FIBO V2 API - Structured Prompt Generation (Inspire mode)
        // This extracts Visual DNA from the image
        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'processing',
            progress: 20,
            step: 'Analyzing image with FIBO...'
        });

        // Use the V2 structured_prompt/generate endpoint with inspire mode
        const briaRes = await fetch('https://engine.prod.bria-api.com/v2/structured_prompt/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api_token': briaApiToken!
            },
            body: JSON.stringify({
                prompt: "Extract the visual DNA of this image",
                image_url: imageUrl,
                image_influence: 0.9
            })
        });

        if (!briaRes.ok) {
            const errText = await briaRes.text();
            console.error('Bria API Error:', briaRes.status, errText);
            throw new Error(`Bria Error: ${briaRes.status} - ${errText}`);
        }

        let briaData = await briaRes.json();

        // Polling if async
        if (briaData.status_url) {
            let attempts = 0;
            const maxAttempts = 60;

            while (attempts < maxAttempts) {
                await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
                    status: 'processing',
                    progress: 30 + Math.min(attempts * 2, 40),
                    step: 'Extracting Visual DNA...'
                });

                const pollRes = await fetch(briaData.status_url, {
                    headers: { 'api_token': briaApiToken! }
                });

                if (!pollRes.ok) throw new Error('Bria status check failed');

                const pollData = await pollRes.json();
                if (pollData.status === 'completed') {
                    briaData = pollData.result || pollData;
                    break;
                }
                if (pollData.status === 'failed') {
                    throw new Error('Bria extraction failed');
                }

                await new Promise(r => setTimeout(r, 2000));
                attempts++;
            }
        }

        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'processing',
            progress: 75,
            step: 'Visual DNA extracted!'
        });

        // Process with Gemini to create clean JSON
        await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
            status: 'processing',
            progress: 85,
            step: 'Converting to structured JSON...'
        });

        let structuredPrompt = briaData;
        if (geminiApiKey) {
            structuredPrompt = await cleanWithGemini(briaData, geminiApiKey);
        }

        // Create Template
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
