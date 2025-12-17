import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FIBO via fal.ai - https://fal.ai/models/bria/fibo/generate
const FIBO_API_URL = 'https://fal.run/fal-ai/bria-fibo';

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const falApiKey = Deno.env.get('FAL_KEY')
        const briaApiToken = Deno.env.get('BRIA_API_TOKEN') // Fallback

        const apiKey = falApiKey || briaApiToken;

        if (!supabaseUrl || !supabaseAnonKey || !apiKey) {
            throw new Error('Missing Environment Variables (need FAL_KEY or BRIA_API_TOKEN)')
        }

        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

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

        const { action, data } = body

        // Generate image using FIBO via fal.ai
        // Accepts: prompt, structured_prompt, image_url, seed, steps_num, aspect_ratio
        const fiboPayload: any = {
            sync_mode: true,
            seed: data.seed || Math.floor(Math.random() * 10000),
            steps_num: data.steps_num || 30,
            aspect_ratio: data.aspect_ratio || '1:1',
        };

        // Add prompt or structured_prompt
        if (data.structured_prompt) {
            fiboPayload.structured_prompt = data.structured_prompt;
        }
        if (data.prompt) {
            fiboPayload.prompt = data.prompt;
        }
        if (data.image_url) {
            fiboPayload.image_url = data.image_url;
        }
        if (data.negative_prompt) {
            fiboPayload.negative_prompt = data.negative_prompt;
        }

        console.log('Calling FIBO with:', JSON.stringify(fiboPayload, null, 2));

        const response = await fetch(FIBO_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${apiKey}`,
            },
            body: JSON.stringify(fiboPayload)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('FIBO API Error:', response.status, errText);
            throw new Error(`FIBO API Error: ${response.status} - ${errText}`);
        }

        const result = await response.json();
        console.log('FIBO Response:', JSON.stringify(result, null, 2));

        // fal.ai returns: { image: { url, width, height }, structured_prompt: {...} }
        return new Response(JSON.stringify({
            image_url: result.image?.url || result.images?.[0]?.url,
            structured_prompt: result.structured_prompt,
            seed: result.seed,
            raw: result,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Gen Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
