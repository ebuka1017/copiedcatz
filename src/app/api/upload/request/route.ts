import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname) => {
                // 1. Verify authentication
                const user = await verifyAuth(request);
                if (!user) {
                    throw new Error('Unauthorized');
                }

                // 2. Rate limiting
                const limiter = rateLimit({
                    interval: 60 * 60 * 1000, // 1 hour
                    uniqueTokenPerInterval: 500,
                });

                try {
                    await limiter.check(50, user.id);
                } catch {
                    throw new Error('Rate limit exceeded');
                }

                // 3. Generate path
                // We want: uploads/{userId}/{uuid}
                // But handleUpload takes pathname from client or we can override?
                // Actually, client sends filename. We can prefix it.
                // But we want a UUID.
                // Let's rely on client sending a name, but we prefix with user ID.
                // Or we can just allow whatever name and Vercel adds random suffix.
                // Let's enforce structure.

                return {
                    allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
                    tokenPayload: JSON.stringify({
                        userId: user.id,
                        // We can pass other metadata if needed
                    }),
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                if (!tokenPayload) return;
                const { userId } = JSON.parse(tokenPayload);

                try {
                    // Store metadata in database
                    // Note: blob.url is the full URL. filepath is the path.
                    // We need to extract filepath or just store URL.
                    // DB schema has 'filepath'.
                    // blob.pathname is available.

                    // We need a unique ID for the upload record.
                    // We can use the blob url or generate one.
                    // The DB expects a UUID for ID.
                    // We can generate one here.

                    await db.upload.create({
                        data: {
                            user_id: userId,
                            filepath: blob.pathname,
                            status: 'PROCESSED', // It's already uploaded
                            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
                            created_at: new Date(),
                        },
                    });

                    // Note: The client needs the blob ID (upload ID) to start extraction.
                    // But onUploadCompleted runs in the background (webhook style) or after upload?
                    // "This function is called after the upload is complete."
                    // But the client `upload` promise resolves with the blob object.
                    // It doesn't receive the result of `onUploadCompleted`.
                    // So the client won't know the DB ID of the upload.
                    // This is a problem.

                    // Solution:
                    // 1. Client uploads.
                    // 2. Client gets blob URL.
                    // 3. Client calls another API to create the Upload record?
                    // OR
                    // 4. Client uses the blob URL as the ID? No, ID is UUID.

                    // Wait, `onUploadCompleted` is server-side.
                    // If we want the client to know the DB ID, we might need to create the DB record *before* upload?
                    // But `handleUpload` is for the token.

                    // Alternative:
                    // Client calls `upload`.
                    // Server `onUploadCompleted` creates record.
                    // Client gets `blob`.
                    // Client calls `extract` with `blob.url` instead of `blob_id`?
                    // `extract` route expects `blob_id`.
                    // It looks up `Upload` by ID.

                    // If we change `extract` to accept `blob_url`, we can look up by filepath/url.
                    // That seems easiest.

                } catch (error) {
                    console.error('Failed to record upload:', error);
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 },
        );
    }
}
