import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Pusher from "https://esm.sh/pusher@5.1.2"

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

        // Pusher Secrets
        const appId = Deno.env.get('PUSHER_APP_ID')
        const key = Deno.env.get('PUSHER_KEY')
        const secret = Deno.env.get('PUSHER_SECRET')
        const cluster = Deno.env.get('NEXT_PUBLIC_PUSHER_CLUSTER')

        if (!supabaseUrl || !supabaseAnonKey || !appId || !key || !secret || !cluster) {
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

        // Parse URLSearchParams (Pusher client sends form-url-encoded, not JSON often for auth)
        // But sometimes it sends JSON depending on client config?
        // Standard Pusher JS client sends multipart/form-data or x-www-form-urlencoded
        const formData = await req.formData()
        const socketId = formData.get('socket_id') as string
        const channelName = formData.get('channel_name') as string

        if (!socketId || !channelName) {
            return new Response(JSON.stringify({ error: 'Missing socket_id or channel_name' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // Verify Access
        const jobId = channelName.replace('private-job-', '')

        // We need to check if this Job belongs to User.
        // Use Service Role to bypass RLS if needed, or just normal client if RLS allows selecting own jobs.
        // Ideally user client.
        const { data: job, error: findError } = await supabaseClient
            .from('ExtractionJob')
            .select('user_id')
            .eq('id', jobId)
            .single()

        if (findError || !job || job.user_id !== user.id) {
            return new Response(JSON.stringify({ error: 'Forbidden' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 403,
            })
        }

        const pusher = new Pusher({
            appId: appId!,
            key: key!,
            secret: secret!,
            cluster: cluster!,
            useTLS: true,
        })

        const authResponse = pusher.authorizeChannel(socketId, channelName)

        return new Response(JSON.stringify(authResponse), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error: any) {
        console.error('Pusher Auth Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
