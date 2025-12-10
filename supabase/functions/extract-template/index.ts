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
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        const briaApiToken = Deno.env.get('BRIA_API_TOKEN')

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
            throw new Error('Missing Supabase Environment Variables')
        }

        // Client for Auth user
        const supabaseClient = createClient(
            supabaseUrl,
            supabaseAnonKey,
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Admin Client for Database operations (if RLS blocks or for specific elevated privs)
        // Actually, we should try to use the user's client if possible, but for deducting credits 
        // or updating jobs, service role might be safer or easier if policies are strict.
        // Let's use serviceRole client for DB ops to ensure we can write to tables regardless of complex policies we might not have set context for.
        // BUT we must verify user first.
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

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

        // Check credits
        const { data: userRecord, error: userError } = await supabaseAdmin
            .from('User')
            .select('credits_remaining')
            .eq('id', user.id)
            .single()

        if (userError || !userRecord || userRecord.credits_remaining <= 0) {
            return new Response(JSON.stringify({ error: 'Insufficient credits' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 402,
            })
        }

        // Create Job
        const job_id = crypto.randomUUID()
        const { error: jobError } = await supabaseAdmin.from('ExtractionJob').insert({
            id: job_id,
            user_id: user.id,
            upload_id: blob_id,
            status: 'PROCESSING',
            progress: 0,
            created_at: new Date().toISOString(),
        })

        if (jobError) throw jobError

        // Call Bria V2 (Structured Prompt)
        // We can't import the client lib easily here because it's a local file.
        // We have to reimplement the call or invoke the generate-image function?
        // Invoking another function is possible!
        // But checking status polling inside a function might timeout the function? 
        // Edge functions have time limits (filesize limit is mostly strictly, runtime is generous but still).
        // Let's implement Bria call directly + manual polling here.

        const imageUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${upload.filepath}`

        // We need to implement pollStatus logic here too
        const pollStatus = async (statusUrl: string) => {
            const maxAttempts = 60
            for (let i = 0; i < maxAttempts; i++) {
                const res = await fetch(statusUrl, { headers: { 'api_token': briaApiToken! } })
                if (!res.ok) throw new Error('Bria status check failed')
                const data = await res.json()
                if (data.status === 'completed') return data.result || data
                if (data.status === 'failed') throw new Error('Bria failed')
                await new Promise(r => setTimeout(r, 1000))
            }
            throw new Error('Timeout')
        }

        try {
            console.log(`Starting extraction for ${imageUrl}`)
            const briaRes = await fetch('https://engine.prod.bria-api.com/v2/structured_prompt/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api_token': briaApiToken! },
                body: JSON.stringify({ images: [imageUrl] })
            })

            if (!briaRes.ok) throw new Error(`Bria Error: ${briaRes.statusText}`)
            let briaData = await briaRes.json()

            if (briaData.status_url) {
                briaData = await pollStatus(briaData.status_url)
            }

            // Create Template
            const { data: template, error: temError } = await supabaseAdmin.from('Template')
                .insert({
                    user_id: user.id,
                    name: `Extraction ${new Date().toLocaleString()}`,
                    original_image_url: imageUrl,
                    structured_prompt: briaData,
                    is_public: false,
                    tags: [],
                    folder_id: null
                })
                .select()
                .single()

            if (temError) throw temError

            // Update Job
            await supabaseAdmin.from('ExtractionJob').update({
                status: 'COMPLETED',
                progress: 100,
            }).eq('id', job_id)

            return new Response(JSON.stringify({
                job_id,
                status: 'COMPLETED',
                template_id: template.id
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })

        } catch (err: any) {
            console.error('Extraction Failed:', err)
            await supabaseAdmin.from('ExtractionJob').update({
                status: 'FAILED',
                error: err.message
            }).eq('id', job_id)

            return new Response(JSON.stringify({ job_id, status: 'FAILED', error: err.message }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            })
        }

    } catch (error: any) {
        console.error('Func Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
