import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Camera, Crop, Loader2 } from 'lucide-react';
import './popup.css';

const Button = ({ children, onClick, disabled, className = '' }: any) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`btn-primary ${className} ${disabled ? 'disabled' : ''}`}
    >
        {children}
    </button>
);

function Popup() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [status, setStatus] = useState<string>('');

    const handleFullPageCapture = async () => {
        setIsCapturing(true);
        setStatus('Capturing...');

        try {
            const response = await chrome.runtime.sendMessage({
                type: 'CAPTURE_AND_UPLOAD'
            });

            if (response.success) {
                setStatus('Done! Opening editor...');
                setTimeout(() => window.close(), 500);
            } else {
                throw new Error(response.error || 'Upload failed');
            }

        } catch (error) {
            console.error(error);
            setStatus('Error: ' + (error as Error).message);
        } finally {
            setIsCapturing(false);
        }
    };

    return (
        <div className="popup-container">
            <div className="header">
                <h1 className="title">Copiedcatz</h1>
                <p className="subtitle">Visual DNA Extractor</p>
            </div>

            <div className="actions">
                <Button onClick={handleFullPageCapture} disabled={isCapturing}>
                    {isCapturing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    Capture Visible Area
                </Button>

                <button
                    className="btn-secondary"
                    disabled={true}
                >
                    <Crop size={16} />
                    Select Area (Coming Soon)
                </button>
            </div>

            {status && (
                <div className="status-message">
                    {status}
                </div>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
