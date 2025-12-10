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
        // Default to V2 endpoints
        let url = 'https://engine.prod.bria-api.com/v2/image/generate'
        let briaBody = data

        if (action === 'generate_structured_prompt') {
            url = 'https://engine.prod.bria-api.com/v2/structured_prompt/generate'
        } else if (action === 'remove_background') {
            url = 'https://engine.prod.bria-api.com/v2/image/edit/remove_background'
        } else if (action === 'increase_resolution') {
            url = 'https://engine.prod.bria-api.com/v2/image/edit/increase_resolution'
        }

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
            throw new Error(`Bria API Error: ${response.status} - ${errText}`)
        }

        let result = await response.json()

        // Handle Polling if needed (Bria V2 is async)
        if (result.status_url) {
            let attempts = 0;
            const maxAttempts = 60;

            while (attempts < maxAttempts) {
                const pollRes = await fetch(result.status_url, { headers: { 'api_token': briaApiToken! } })
                if (!pollRes.ok) throw new Error('Bria status check failed')

                const pollData = await pollRes.json()
                if (pollData.status === 'completed') {
                    result = pollData.result || pollData
                    break;
                }
                if (pollData.status === 'failed') throw new Error('Bria generation failed')

                await new Promise(r => setTimeout(r, 1000))
                attempts++;
            }
        }

        return new Response(JSON.stringify(result), {
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
