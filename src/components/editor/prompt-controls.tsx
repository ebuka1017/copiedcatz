'use client';

import React, { useState } from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';
import { StructuredPrompt } from '@/lib/bria/types';
import { StructuredPromptEditor } from '@/components/editor/StructuredPromptEditor';
import { ArrowDown01Icon, ArrowRight01Icon, Settings01Icon, CodeIcon, TextFontIcon } from '@hugeicons/react';
import styles from '@/components/ui/glass-card.module.css';
import { GlassButton } from '@/components/ui/glass-button';

export function PromptControls() {
    const template = useTemplateStore(state => state.template);
    const updatePrompt = useTemplateStore(state => state.updatePrompt);
    const batchUpdatePrompt = useTemplateStore(state => state.batchUpdatePrompt);
    const setStructuredPrompt = useTemplateStore(state => state.setStructuredPrompt);
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

    if (!template) return null;

    // Cast to new type safely
    const prompt = template.structured_prompt as unknown as StructuredPrompt;

    const handleSimpleUpdate = (field: keyof StructuredPrompt, value: any) => {
        // For top-level fields
        updatePrompt(field, '', value);
    };

    const handleNestedUpdate = (category: keyof StructuredPrompt, attribute: string, value: any) => {
        updatePrompt(category, attribute, value);
    };

    const handleAdvancedUpdate = (newPrompt: StructuredPrompt) => {
        setStructuredPrompt(newPrompt);
    };

    return (
        <div className={`${styles.card} h-full flex flex-col overflow-hidden`}>
            <div className="p-4 border-b border-slate-200/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Settings01Icon className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Visual DNA</h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const newStatus = !template.is_public;
                            // Optimistic update
                            useTemplateStore.setState(state => {
                                if (state.template) state.template.is_public = newStatus;
                            });
                            // Trigger save
                            useTemplateStore.getState().saveTemplate();
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors border ${template.is_public
                                ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                        title={template.is_public ? "Publicly visible" : "Private template"}
                    >
                        {template.is_public ? 'Public' : 'Private'}
                    </button>
                    <div className="flex bg-slate-900/20 rounded-lg p-1">
                        <button
                            onClick={() => setMode('simple')}
                            className={`p-1.5 rounded-md transition-all ${mode === 'simple' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}
                            title="Simple Mode"
                            aria-label="Switch to Simple Mode"
                        >
                            <TextFontIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setMode('advanced')}
                            className={`p-1.5 rounded-md transition-all ${mode === 'advanced' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}
                            title="Advanced Mode (JSON)"
                            aria-label="Switch to Advanced Mode"
                        >
                            <CodeIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {mode === 'simple' ? (
                    <div className="space-y-6">
                        {/* Short Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Description</label>
                            <textarea
                                value={prompt.short_description || ''}
                                onChange={(e) => handleSimpleUpdate('short_description', e.target.value)}
                                className="w-full h-24 bg-slate-900/20 border border-slate-200/10 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                placeholder="Describe the image..."
                            />
                        </div>

                        {/* Style / Medium */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Style & Medium</label>
                            <input
                                type="text"
                                value={prompt.style_medium || ''}
                                onChange={(e) => handleSimpleUpdate('style_medium', e.target.value)}
                                className="w-full bg-slate-900/20 border border-slate-200/10 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                placeholder="e.g., Oil painting, Realistic photo"
                            />
                        </div>

                        {/* Lighting */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Lighting</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    value={prompt.lighting?.conditions || ''}
                                    onChange={(e) => handleNestedUpdate('lighting', 'conditions', e.target.value)}
                                    className="bg-slate-900/20 border border-slate-200/10 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    placeholder="Conditions (e.g. Sunny)"
                                />
                                <input
                                    type="text"
                                    value={prompt.lighting?.direction || ''}
                                    onChange={(e) => handleNestedUpdate('lighting', 'direction', e.target.value)}
                                    className="bg-slate-900/20 border border-slate-200/10 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    placeholder="Direction"
                                />
                            </div>
                        </div>

                        {/* Aesthetics */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Mood & Atmosphere</label>
                            <input
                                type="text"
                                value={prompt.aesthetics?.mood_atmosphere || ''}
                                onChange={(e) => handleNestedUpdate('aesthetics', 'mood_atmosphere', e.target.value)}
                                className="w-full bg-slate-900/20 border border-slate-200/10 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500/50 outline-none"
                                placeholder="e.g., Melancholic, Cheerful"
                            />
                        </div>
                    </div>
                ) : (
                    <StructuredPromptEditor
                        initialPrompt={prompt}
                        onChange={handleAdvancedUpdate}
                        className="h-full border-0 shadow-none !bg-transparent"
                    />
                )}
            </div>
        </div>
    );
}
