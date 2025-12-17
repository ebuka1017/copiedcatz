'use client';

import { useState, useEffect } from 'react';
import { StructuredPrompt } from '@/lib/bria/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Copy, FileJson, Download } from 'lucide-react';

interface StructuredPromptEditorProps {
    initialPrompt?: StructuredPrompt;
    onChange: (prompt: StructuredPrompt) => void;
    className?: string;
}

export function StructuredPromptEditor({ initialPrompt, onChange, className }: StructuredPromptEditorProps) {
    const [jsonString, setJsonString] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (initialPrompt) {
            setJsonString(JSON.stringify(initialPrompt, null, 2));
        }
    }, [initialPrompt]);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setJsonString(newValue);

        try {
            const parsed = JSON.parse(newValue);
            if (typeof parsed === 'object' && parsed !== null) {
                setIsValid(true);
                setError(null);
                onChange(parsed as StructuredPrompt);
            } else {
                setIsValid(false);
                setError('Invalid JSON structure');
            }
        } catch (err) {
            setIsValid(false);
            setError((err as Error).message);
        }
    };

    const formatJson = () => {
        try {
            const parsed = JSON.parse(jsonString);
            setJsonString(JSON.stringify(parsed, null, 2));
            setError(null);
            setIsValid(true);
        } catch (err) {
            // Ignore format error if already invalid
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const downloadJson = () => {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visual-dna.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className={`flex flex-col h-full bg-slate-900 border-slate-700 ${className}`}>
            {/* Header with prominent copy button */}
            <div className="flex items-center justify-between mb-4 p-4 bg-slate-800/50 rounded-t-lg -mx-4 -mt-4">
                <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Visual DNA (JSON)</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={formatJson}
                        disabled={!isValid}
                        className="text-xs h-8 bg-slate-700 hover:bg-slate-600"
                    >
                        Format
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={downloadJson}
                        disabled={!isValid}
                        className="text-xs h-8 bg-slate-700 hover:bg-slate-600"
                    >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                    </Button>
                    <Button
                        onClick={copyToClipboard}
                        className={`text-xs h-8 ${copied ? 'bg-green-600 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                        {copied ? (
                            <>
                                <Check className="w-3 h-3 mr-1" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copy JSON
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* JSON Editor */}
            <div className="relative flex-grow">
                <textarea
                    value={jsonString}
                    onChange={handleJsonChange}
                    className={`w-full h-full min-h-[400px] bg-slate-950 border rounded-lg p-4 font-mono text-sm text-green-400 placeholder:text-slate-500 resize-none focus:outline-none focus:ring-2 transition-all ${isValid
                        ? 'border-slate-600 focus:ring-blue-500 focus:border-blue-500'
                        : 'border-red-500 focus:ring-red-500'
                        }`}
                    spellCheck={false}
                    placeholder="// Visual DNA JSON will appear here after extraction..."
                />

                {!isValid && error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-950/90 border border-red-700 rounded-lg p-3 flex items-start gap-2 text-red-200 text-xs">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {/* Help text */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <p className="text-xs text-blue-300">
                    <strong>Copy this JSON</strong> to use in other projects or share your Visual DNA.
                    Edit any field to modify the generation parameters.
                </p>
            </div>
        </Card>
    );
}
