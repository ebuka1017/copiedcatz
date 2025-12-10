import Pusher from 'pusher-js';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    channelAuthorization: {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/pusher-auth`,
        transport: 'ajax',
        headersProvider: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            return {
                Authorization: `Bearer ${session?.access_token}`,
            };
        },
    },
});
