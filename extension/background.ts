/**
 * Background Service Worker for Copiedcatz Chrome Extension
 * Handles image capture and upload coordination
 */

import { captureAndUpload, captureVisibleTab, uploadImage, openEditor } from './utils';

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CAPTURE_AND_UPLOAD') {
        // V2: Full flow with upload handoff
        captureAndUpload()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Capture and upload failed:', error);
                sendResponse({ success: false, error: error.message });
            });
        return true; // Required for async response
    }

    if (message.type === 'CAPTURE_VISIBLE_TAB') {
        // Legacy: Just capture and return data URL
        chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ dataUrl });
            }
        });
        return true;
    }

    if (message.type === 'AREA_SELECTED') {
        // Handle area selection (from content script)
        // For MVP, we'll just capture full visible tab
        // In future, crop to selected area
        captureAndUpload()
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                sendResponse({ success: false, error: error.message });
            });
        return true;
    }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Copiedcatz extension installed');

    // Create context menu for right-click capture
    chrome.contextMenus.create({
        id: 'copiedcatz-capture',
        title: 'Copiedcatz: Extract Visual DNA',
        contexts: ['image', 'page'],
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'copiedcatz-capture') {
        if (info.srcUrl) {
            // Image was right-clicked - download and upload it
            downloadAndUpload(info.srcUrl);
        } else {
            // Page was right-clicked - capture visible tab
            captureAndUpload();
        }
    }
});

/**
 * Download image from URL and upload to our service
 */
async function downloadAndUpload(imageUrl: string) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const blobId = await uploadImage(blob);
        openEditor(blobId);
    } catch (error) {
        console.error('Failed to download and upload image:', error);
    }
}
