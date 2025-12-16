'use client';

import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher {
    if (!pusherClient) {
        pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });
    }
    return pusherClient;
}

export function subscribeToPusherChannel(channelName: string) {
    const pusher = getPusherClient();
    return pusher.subscribe(channelName);
}

export function unsubscribeFromPusherChannel(channelName: string) {
    const pusher = getPusherClient();
    pusher.unsubscribe(channelName);
}
