/**
 * Utility functions for Chrome Extension -> WebApp handoff
 * Handles secure upload to Vercel Blob via signed URLs
 */

const APP_URL = chrome.runtime.getManifest().homepage_url || 'http://localhost:3000';

export interface UploadResult {
    blob_id: string;
    signed_url: string;
    expires_at: string;
}

/**
 * Request a signed upload URL from the backend
 */
export async function requestUploadUrl(): Promise<UploadResult> {
    const response = await fetch(`${APP_URL}/api/upload/request`, {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request upload URL');
    }

    return response.json();
}

/**
 * Upload image blob to Vercel Blob using signed URL
 */
export async function uploadToBlob(signedUrl: string, imageBlob: Blob): Promise<void> {
    const response = await fetch(signedUrl, {
        method: 'PUT',
        body: imageBlob,
        headers: {
            'Content-Type': imageBlob.type,
        },
    });

    if (!response.ok) {
        throw new Error('Failed to upload image to blob storage');
    }
}

/**
 * Convert data URL (from canvas capture) to Blob
 */
export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
}

/**
 * Complete upload flow: request URL, upload image, return blob_id
 */
export async function uploadImage(imageBlob: Blob): Promise<string> {
    // 1. Request signed URL
    const { blob_id, signed_url } = await requestUploadUrl();

    // 2. Upload to Blob
    await uploadToBlob(signed_url, imageBlob);

    // 3. Return blob_id for redirect
    return blob_id;
}

/**
 * Open the web app editor with the uploaded blob_id
 */
export function openEditor(blobId: string): void {
    chrome.tabs.create({
        url: `${APP_URL}/editor/new?blob_id=${blobId}`,
    });
}

/**
 * Capture visible tab and return as Blob
 */
export async function captureVisibleTab(): Promise<Blob> {
    return new Promise((resolve, reject) => {
        chrome.tabs.captureVisibleTab(
            { format: 'png' },
            async (dataUrl) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                    return;
                }

                try {
                    const blob = await dataUrlToBlob(dataUrl);
                    resolve(blob);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

/**
 * Crop image blob to specific area
 */
async function cropImage(blob: Blob, area: { x: number, y: number, width: number, height: number }): Promise<Blob> {
    // Create bitmap from blob
    const bitmap = await createImageBitmap(blob);

    // Create offscreen canvas
    const canvas = new OffscreenCanvas(area.width, area.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    // Draw cropped area
    // Source: x, y, w, h -> Dest: 0, 0, w, h
    ctx.drawImage(bitmap, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);

    // Convert back to blob
    return await canvas.convertToBlob({ type: 'image/png' });
}

/**
 * Full capture -> upload -> redirect flow
 */
export async function captureAndUpload(area?: { x: number, y: number, width: number, height: number }): Promise<void> {
    // 1. Capture full tab
    let imageBlob = await captureVisibleTab();

    // 2. Crop if area provided
    if (area) {
        // Adjust for device pixel ratio if needed? 
        // captureVisibleTab usually captures at actual device pixels, but coordinates from content script are CSS pixels.
        // We might need to multiply by window.devicePixelRatio, but we don't have access to window in SW.
        // We can ask content script to send pixel ratio or just assume 1 for MVP.
        // For now, let's assume 1:1 or that the user will select what they see.
        // Actually, captureVisibleTab in Chrome often captures at 1x unless specified? 
        // No, it captures what's on screen.
        // Let's stick to simple crop for now.
        try {
            imageBlob = await cropImage(imageBlob, area);
        } catch (e) {
            console.error('Crop failed, uploading full image', e);
        }
    }

    // 3. Upload
    const blobId = await uploadImage(imageBlob);

    // 4. Redirect
    openEditor(blobId);
}
