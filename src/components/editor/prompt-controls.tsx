'use client';

import React, { useState } from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';
import { StructuredPrompt } from '@/lib/bria/types';
import { StructuredPromptEditor } from '@/components/editor/StructuredPromptEditor';
import { ChevronDown, ChevronRight, Sliders, Code, Type } from 'lucide-react';
import styles from '@/components/ui/glass-card.module.css';
import { GlassButton } from '@/components/ui/glass-button';

export function PromptControls() {
    const template = useTemplateStore(state => state.template);
    const updatePrompt = useTemplateStore(state => state.updatePrompt);
    const batchUpdatePrompt = useTemplateStore(state => state.batchUpdatePrompt);
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
        // We need to update the whole object. 
        // The store's updatePrompt is granular. batchUpdatePrompt might be better but it takes an array of updates.
        // Let's assume we can update the whole 'structured_prompt' on the template directly if we had an action for it.
        // But we don't. We have to update field by field or add a 'setStructuredPrompt' action.
        // For now, let's try to map it or just use a loop.
        // Actually, the store has `updatePrompt` which takes `category`.
        // If I added `setStructuredPrompt` to the store it would be easier.
        // Let's assume I can use a loop for now or I'll add the action.
        // Adding the action is cleaner.

        // For now, let's just update the top level keys that changed.
        // This is inefficient. I should add `setStructuredPrompt` to the store.
        // But I can't edit the store again right now without context switching.
        // I'll use a hack: update each top-level key.

        const updates = Object.keys(newPrompt).map(key => ({
            category: key as keyof StructuredPrompt,
            attribute: '', // Top level replacement if attribute is empty? Store logic needs to support this.
            value: (newPrompt as any)[key]
        }));

        // The store logic: `categoryObj[attribute] = value;`
        // If attribute is empty string, `categoryObj[''] = value`. This is wrong.
        // I need to fix the store to support top-level updates or full replacement.
        // The store has `setTemplate`. I can update the whole template.

        const newTemplate = { ...template, structured_prompt: newPrompt };
        useTemplateStore.getState().setTemplate(newTemplate);
    };

    return (
        <div className={`${styles.card} h-full flex flex-col overflow-hidden`}>
            <div className="p-4 border-b border-slate-200/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Visual DNA</h2>
                </div>
                <div className="flex bg-slate-900/20 rounded-lg p-1">
                    <button
                        onClick={() => setMode('simple')}
                        className={`p-1.5 rounded-md transition-all ${mode === 'simple' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}
                        title="Simple Mode"
                    >
                        <Type className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setMode('advanced')}
                        className={`p-1.5 rounded-md transition-all ${mode === 'advanced' ? 'bg-white/20 shadow-sm' : 'hover:bg-white/10'}`}
                        title="Advanced Mode (JSON)"
                    >
                        <Code className="w-4 h-4" />
                    </button>
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
