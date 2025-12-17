import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const briaApiToken = Deno.env.get('BRIA_API_TOKEN')

        if (!supabaseUrl || !supabaseAnonKey || !briaApiToken) {
            throw new Error('Missing Environment Variables')
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

        // Handle status check action
        if (action === 'check_status') {
            const statusUrl = data.status_url
            if (!statusUrl) {
                return new Response(JSON.stringify({ error: 'Missing status_url' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                })
            }

            const allowedDomains = ['engine.prod.bria-api.com', 'api.bria.ai']
            const urlObj = new URL(statusUrl)
            if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
                return new Response(JSON.stringify({ error: 'Invalid status URL domain' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                })
            }

            const statusRes = await fetch(statusUrl, { headers: { 'api_token': briaApiToken } })
            if (!statusRes.ok) throw new Error('Status check failed')
            const statusData = await statusRes.json()

            return new Response(JSON.stringify(statusData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // Generate image using Bria API
        // https://docs.bria.ai/image-generation/v2-endpoints/image-generate
        let url = 'https://engine.prod.bria-api.com/v1/text-to-image/base/2.3'
        let briaBody = data

        if (action === 'generate_from_prompt') {
            // Use text-to-image with the structured prompt as description
            const prompt = typeof data.structured_prompt === 'object'
                ? data.structured_prompt.short_description || JSON.stringify(data.structured_prompt)
                : data.prompt || 'Generate an image'

            briaBody = {
                prompt: prompt,
                num_results: 1,
                sync: false,
                ...data
            }
        }

        console.log('Calling Bria API:', url, JSON.stringify(briaBody, null, 2));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api_token': briaApiToken
            },
            body: JSON.stringify(briaBody)
        })

        if (!response.ok) {
            const errText = await response.text()
            console.error('Bria API Error:', response.status, errText);
            throw new Error(`Bria API Error: ${response.status} - ${errText}`)
        }

        let result = await response.json()
        console.log('Bria Response:', JSON.stringify(result, null, 2));

        // Handle Polling if async
        if (result.status_url) {
            let attempts = 0;
            const maxAttempts = 60;

            while (attempts < maxAttempts) {
                const pollRes = await fetch(result.status_url, { headers: { 'api_token': briaApiToken! } })
                if (!pollRes.ok) throw new Error('Bria status check failed')

                const pollData = await pollRes.json()
                console.log('Poll attempt', attempts, ':', pollData.status);

                if (pollData.status === 'completed') {
                    result = pollData.result || pollData
                    break;
                }
                if (pollData.status === 'failed') throw new Error('Bria generation failed')

                await new Promise(r => setTimeout(r, 2000))
                attempts++;
            }
        }

        // Normalize response
        return new Response(JSON.stringify({
            image_url: result.result?.[0]?.url || result.url || result.image_url,
            images: result.result || result.images,
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
