'use client';

import React, { useState } from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';
import { MessageSquare, Loader2, Send, Sparkles } from 'lucide-react';
import { callEdgeFunction } from '@/lib/supabase/client';

export function NaturalLanguageEdit() {
    const [instruction, setInstruction] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { template, setStructuredPrompt } = useTemplateStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!instruction.trim() || !template?.structured_prompt) return;

        setLoading(true);
        setError(null);

        try {
            const { result } = await callEdgeFunction('gemini', {
                body: {
                    action: 'natural_edit',
                    data: {
                        prompt: template.structured_prompt,
                        instruction: instruction.trim()
                    }
                }
            });

            setStructuredPrompt(result);
            setInstruction('');
        } catch (err: any) {
            setError(err.message || 'Failed to apply edit');
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        "Make the lighting more dramatic",
        "Add a sunset background",
        "Change to a low angle shot",
        "Make it more cinematic",
        "Add bokeh effect",
        "Change colors to cooler tones"
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Quick Edit with AI
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    placeholder="e.g., Make the lighting warmer..."
                    disabled={loading}
                    className="w-full bg-slate-800/50 border border-slate-600 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-colors"
                />
                <button
                    type="submit"
                    disabled={!instruction.trim() || loading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                </button>
            </form>

            {error && (
                <p className="text-xs text-red-400">{error}</p>
            )}

            {/* Quick suggestions */}
            <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 4).map((suggestion, i) => (
                    <button
                        key={i}
                        onClick={() => setInstruction(suggestion)}
                        disabled={loading}
                        className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-300 transition-colors disabled:opacity-50"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
}
