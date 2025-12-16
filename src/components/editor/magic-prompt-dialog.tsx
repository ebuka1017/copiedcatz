'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Wand2, Zap } from 'lucide-react';
import { useTemplateStore } from '@/lib/stores/template-store';

interface MagicPromptDialogProps {
    children?: React.ReactNode;
}

export function MagicPromptDialog({ children }: MagicPromptDialogProps) {
    const [open, setOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [error, setError] = useState<string | null>(null);
    const setStructuredPrompt = useTemplateStore(state => state.setStructuredPrompt);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);
        setLoadingStep('Analyzing your description...');

        try {
            // Use Gemini to generate the structured prompt
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'generate_from_description',
                    data: { description: prompt }
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to generate');
            }

            setLoadingStep('Building Visual DNA structure...');
            const { result } = await response.json();

            setStructuredPrompt(result);
            setOpen(false);
            setPrompt('');

        } catch (error: any) {
            console.error('Magic prompt error:', error);
            setError(error.message || 'Failed to generate Visual DNA. Please try again.');
        } finally {
            setLoading(false);
            setLoadingStep('');
        }
    };

    const examplePrompts = [
        "A cat astronaut floating in space",
        "Moody coffee shop with warm lighting",
        "Product shot of sneakers on concrete",
        "Cinematic portrait in golden hour"
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <button className="h-8 w-8 flex items-center justify-center rounded-full text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 transition-colors">
                        <Sparkles className="h-4 w-4" />
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800 text-white">
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
                            <Wand2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl flex items-center gap-2">
                                Magic Prompt
                                <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
                                    Powered by Gemini
                                </span>
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Describe your idea in plain English, and AI will generate the full Visual DNA.
                            </DialogDescription>
                        </div>
                    </div>

                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none placeholder-slate-500"
                        placeholder="A cyberpunk street in Tokyo at night, raining, neon reflections on wet pavement, cinematic mood..."
                        disabled={loading}
                    />

                    {/* Example prompts */}
                    {!loading && !prompt && (
                        <div className="space-y-2">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Try an example:</p>
                            <div className="flex flex-wrap gap-2">
                                {examplePrompts.map((example, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setPrompt(example)}
                                        className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Loading state */}
                    {loading && loadingStep && (
                        <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                            <span className="text-sm text-blue-300">{loadingStep}</span>
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => setOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || loading}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
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
