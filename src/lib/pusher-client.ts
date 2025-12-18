'use client';

import Pusher from 'pusher-js';

let pusherClient: Pusher | null = null;
let initializationFailed = false;

export function getPusherClient(): Pusher | null {
    if (initializationFailed) {
        return null;
    }

    if (!pusherClient) {
        const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
        const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

        if (!pusherKey || !pusherCluster) {
            console.warn('Pusher environment variables not configured. Real-time updates disabled.');
            initializationFailed = true;
            return null;
        }

        try {
            pusherClient = new Pusher(pusherKey, {
                cluster: pusherCluster,
            });
        } catch (error) {
            console.error('Failed to initialize Pusher:', error);
            initializationFailed = true;
            return null;
        }
    }
    return pusherClient;
}

// Mock channel for when Pusher is not available
const mockChannel = {
    bind: () => mockChannel,
    unbind: () => mockChannel,
    unbind_all: () => mockChannel,
};

export function subscribeToPusherChannel(channelName: string) {
    const pusher = getPusherClient();
    if (!pusher) {
        // Return mock channel that does nothing
        return mockChannel as any;
    }
    return pusher.subscribe(channelName);
}

export function unsubscribeFromPusherChannel(channelName: string) {
    const pusher = getPusherClient();
    if (!pusher) return;
    pusher.unsubscribe(channelName);
}
