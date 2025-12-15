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

        if (!supabaseUrl || !supabaseAnonKey) {
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

        const formData = await req.formData()
        const file = formData.get('file')

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file provided' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`

        const { data, error } = await supabaseClient
            .storage
            .from('uploads')
            .upload(fileName, file, {
                contentType: file.type,
                upsert: false
            })

        if (error) throw error

        // Also create the Upload record in the database
        // Set expiry to 24 hours from now
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        const { data: uploadRecord, error: dbError } = await supabaseClient
            .from('Upload')
            .insert({
                user_id: user.id,
                filepath: fileName,
                filename: file.name,
                filetype: file.type,
                size: file.size,
                expires_at: expiresAt
            })
            .select()
            .single()

        if (dbError) throw dbError

        return new Response(JSON.stringify(uploadRecord), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Upload Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
