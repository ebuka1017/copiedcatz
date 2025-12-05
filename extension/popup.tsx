disabled = { disabled }
style = {{
    width: '100%',
        padding: '12px',
            background: '#3b82f6',
                color: 'white',
                    border: 'none',
                        borderRadius: '8px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                                opacity: disabled ? 0.7 : 1,
                                    display: 'flex',
                                        alignItems: 'center',
                                            justifyContent: 'center',
                                                gap: '8px',
                                                    fontWeight: 500,
            ...className
}}
    >
    { children }
    </button >
);

function Popup() {
    const [isCapturing, setIsCapturing] = useState(false);
    const [status, setStatus] = useState<string>('');

    const handleFullPageCapture = async () => {
        setIsCapturing(true);
        setStatus('Capturing...');

        try {
            // Use background script's CAPTURE_AND_UPLOAD message
            // This handles the full flow via utils.ts
            const response = await chrome.runtime.sendMessage({
                type: 'CAPTURE_AND_UPLOAD'
            });

            if (response.success) {
                setStatus('Done! Opening editor...');
                // Background script already opened the tab
                // Close popup after short delay
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
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0, fontSize: '20px', color: '#0f172a' }}>Copiedcatz</h1>
                <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>Visual DNA Extractor</p>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center' }}>
                <Button onClick={handleFullPageCapture} disabled={isCapturing}>
                    {isCapturing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    Capture Visible Area
                </Button>

                <Button
                    onClick={() => { }} // TODO: Implement selection mode
                    disabled={true}
                    style={{ background: 'transparent', border: '1px solid #e2e8f0', color: '#64748b' }}
                >
                    <Crop size={16} />
                    Select Area (Coming Soon)
                </Button>
            </div>

            {status && (
                <div style={{
                    padding: '12px',
                    background: '#eff6ff',
                    color: '#1e40af',
                    borderRadius: '8px',
                    fontSize: '13px',
                    textAlign: 'center'
                }}>
                    {status}
                </div>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
