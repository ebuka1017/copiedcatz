import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Pusher from "npm:pusher"

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
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const briaApiToken = Deno.env.get('BRIA_API_TOKEN')
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

        // Call Bria V2 Structured Prompt
        const briaRes = await fetch('https://engine.prod.bria-api.com/v2/structured_prompt/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'api_token': briaApiToken! },
            body: JSON.stringify({ images: [imageUrl] })
        })

        if (!briaRes.ok) throw new Error(`Bria Error: ${briaRes.statusText}`)
        let briaData = await briaRes.json()

        // Polling Logic
        if (briaData.status_url) {
            let attempts = 0;
            const maxAttempts = 30;

            while (attempts < maxAttempts) {
                await pusher.trigger(`user-${user.id}`, 'extraction-progress', {
                    status: 'processing',
                    progress: 20 + (attempts * 2),
                    step: 'Analyzing visual DNA...'
                });

                const pollRes = await fetch(briaData.status_url, { headers: { 'api_token': briaApiToken! } })
                if (!pollRes.ok) throw new Error('Bria status check failed')

                const pollData = await pollRes.json()
                if (pollData.status === 'completed') {
                    briaData = pollData.result || pollData
                    break;
                }
                if (pollData.status === 'failed') throw new Error('Bria extraction failed')

                await new Promise(r => setTimeout(r, 1000))
                attempts++;
            }
        }

        // Create Template
        const { data: template, error: temError } = await supabaseAdmin.from('Template')
            .insert({
                user_id: user.id,
                name: `Extraction ${new Date().toLocaleString()}`,
                original_image_url: imageUrl,
                structured_prompt: briaData,
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
