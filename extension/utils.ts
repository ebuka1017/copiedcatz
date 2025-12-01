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
 * Full capture -> upload -> redirect flow
 */
export async function captureAndUpload(): Promise<void> {
    // 1. Capture
    const imageBlob = await captureVisibleTab();

    // 2. Upload
    const blobId = await uploadImage(imageBlob);

    // 3. Redirect
    openEditor(blobId);
}
