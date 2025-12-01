'use client';

import { useState, useEffect } from 'react';
import { StructuredPrompt } from '@/lib/bria/types';
import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { AlertCircle, Check, Copy, FileJson } from 'lucide-react';

interface StructuredPromptEditorProps {
    initialPrompt?: StructuredPrompt;
    onChange: (prompt: StructuredPrompt) => void;
    className?: string;
}

export function StructuredPromptEditor({ initialPrompt, onChange, className }: StructuredPromptEditorProps) {
    const [jsonString, setJsonString] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isValid, setIsValid] = useState(true);

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
            // Basic validation: check if it has at least 'short_description' or 'objects'
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

    return (
        <GlassCard className={`flex flex-col h-full ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FileJson className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">Structured Prompt</h3>
                </div>
                <div className="flex items-center gap-2">
                    <GlassButton variant="secondary" onClick={formatJson} disabled={!isValid} className="text-xs h-8">
                        Format
                    </GlassButton>
                </div>
            </div>

            <div className="relative flex-grow">
                <textarea
                    value={jsonString}
                    onChange={handleJsonChange}
                    className={`w-full h-full min-h-[400px] bg-slate-50 dark:bg-slate-900/50 border rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 transition-all ${isValid
                            ? 'border-slate-200 dark:border-slate-700 focus:ring-blue-500/50'
                            : 'border-red-500/50 focus:ring-red-500/50'
                        }`}
                    spellCheck={false}
                    placeholder="// Enter structured prompt JSON here..."
                />

                {!isValid && error && (
                    <div className="absolute bottom-4 left-4 right-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2 text-red-400 text-xs backdrop-blur-md">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                <p>Edit the JSON to refine the image generation. Changes are applied automatically when valid.</p>
            </div>
        </GlassCard>
    );
}
