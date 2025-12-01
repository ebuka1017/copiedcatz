// Content script for page interaction

// Content script for page interaction

// Listen for selection mode toggle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'TOGGLE_SELECTION_MODE') {
        toggleSelectionMode(message.enabled);
    }
});

let isSelectionMode = false;
let overlay: HTMLDivElement | null = null;

function toggleSelectionMode(enabled: boolean) {
    isSelectionMode = enabled;

    if (enabled) {
        document.body.style.cursor = 'crosshair';
        createOverlay();
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    } else {
        document.body.style.cursor = 'default';
        removeOverlay();
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }
}

function createOverlay() {
    overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '999999';
    overlay.style.pointerEvents = 'none'; // Let events pass through to document for coordinates
    // overlay.style.background = 'rgba(0, 0, 0, 0.1)';
    document.body.appendChild(overlay);
}

function removeOverlay() {
    if (overlay) {
        overlay.remove();
        overlay = null;
    }
}

// Selection logic (simplified for MVP - just full page capture trigger for now)
// In a real implementation, we'd draw a box on the overlay
let startX = 0;
let startY = 0;

function handleMouseDown(e: MouseEvent) {
    if (!isSelectionMode) return;
    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
}

function handleMouseMove(e: MouseEvent) {
    if (!isSelectionMode) return;
    // Draw selection box on overlay
    if (!overlay) return;

    const currentX = e.clientX;
    const currentY = e.clientY;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    // Create or update selection box
    let selectionBox = document.getElementById('copiedcatz-selection-box');
    if (!selectionBox) {
        selectionBox = document.createElement('div');
        selectionBox.id = 'copiedcatz-selection-box';
        selectionBox.style.position = 'absolute';
        selectionBox.style.border = '2px solid #00ff00';
        selectionBox.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
        selectionBox.style.pointerEvents = 'none';
        overlay.appendChild(selectionBox);
    }

    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
}

function handleMouseUp(e: MouseEvent) {
    if (!isSelectionMode) return;

    // Capture coordinates
    const endX = e.clientX;
    const endY = e.clientY;

    // Send capture request to popup/background
    chrome.runtime.sendMessage({
        type: 'AREA_SELECTED',
        area: {
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY)
        }
    });

    toggleSelectionMode(false);
}
