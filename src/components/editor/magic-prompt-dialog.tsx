'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useTemplateStore } from '@/lib/stores/template-store';

interface MagicPromptDialogProps {
    children?: React.ReactNode;
}

export function MagicPromptDialog({ children }: MagicPromptDialogProps) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const setStructuredPrompt = useTemplateStore(state => state.setStructuredPrompt);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/generate/bria/v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_structured_prompt',
                    data: { prompt: prompt }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate prompt');
            }

            const data = await response.json();

            // Data might be wrapped, checking structure
            // Based on client.ts, it returns { structured_prompt: ... } or result
            const structuredPrompt = data.structured_prompt || data;

            setStructuredPrompt(structuredPrompt);
            setOpen(false);
            setPrompt('');

        } catch (error) {
            console.error('Magic prompt error:', error);
            setError('Failed to divine the visual DNA. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <button className="h-8 w-8 flex items-center justify-center rounded-md text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors">
                        <Sparkles className="h-4 w-4" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Wand2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Magic Prompt</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Describe your idea in plain English, and we'll generate the full Visual DNA.
                            </DialogDescription>
                        </div>
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none placeholder-slate-500"
                        placeholder="A cyberpunk street in Tokyo at night, raining, neon reflections..."
                    />

                    {error && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button onClick={handleGenerate} disabled={!prompt.trim() || loading} className="bg-blue-600 hover:bg-blue-500">
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Divining...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate DNA
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
