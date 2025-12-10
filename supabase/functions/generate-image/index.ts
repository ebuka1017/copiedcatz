import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
        const briaApiToken = Deno.env.get('BRIA_API_TOKEN')

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error('Missing Supabase Environment Variables')
        }

        // Create Supabase Client
        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Verify User
        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            })
        }

        // Parse body
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

        if (!briaApiToken) {
            console.error('BRIA_API_TOKEN not set')
            throw new Error('Server misconfiguration')
        }

        // Handle check_status explicitly
        if (action === 'check_status') {
            if (!data.status_url) {
                return new Response(JSON.stringify({ error: 'Missing status_url for check_status' }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                })
            }
            const url = data.status_url
            console.log(`Checking status: ${url}`)
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'api_token': briaApiToken
                }
            })

            if (!response.ok) {
                const errText = await response.text()
                return new Response(JSON.stringify({ error: `Bria Status Check Error: ${response.status} - ${errText}` }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                })
            }

            const result = await response.json()
            return new Response(JSON.stringify(result), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        let url = ''
        let briaBody = {}

        if (action === 'generate_image') {
            url = 'https://engine.prod.bria-api.com/v2/image/generate'
            briaBody = data
        } else if (action === 'generate_structured_prompt') {
            url = 'https://engine.prod.bria-api.com/v2/structured_prompt/generate'
            briaBody = data
        } else if (action === 'remove_background') {
            url = 'https://engine.prod.bria-api.com/v2/image/edit/remove_background'
            briaBody = data
        } else if (action === 'increase_resolution') {
            url = 'https://engine.prod.bria-api.com/v2/image/edit/increase_resolution'
            briaBody = data
        } else {
            return new Response(JSON.stringify({ error: `Invalid action: ${action}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        console.log(`Calling Bria API: ${url} for user ${user.id}`)

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
            console.error(`Bria API Error (${response.status}): ${errText}`)
            return new Response(JSON.stringify({ error: `Bria API Error: ${response.status} - ${errText}` }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

        const result = await response.json()

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Edge Function Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
