'use client';

import React, { useState } from 'react';
import { useTemplateStore, StructuredPrompt } from '@/lib/stores/template-store';
import { ChevronDown, ChevronRight, Sliders } from 'lucide-react';
import styles from '@/components/ui/glass-card.module.css';

const CATEGORIES: { key: keyof StructuredPrompt; label: string }[] = [
    { key: 'scene', label: 'Scene' },
    { key: 'lighting', label: 'Lighting' },
    { key: 'camera', label: 'Camera' },
    { key: 'composition', label: 'Composition' },
    { key: 'color', label: 'Color' },
    { key: 'style', label: 'Style' },
    { key: 'technical', label: 'Technical' },
];

export function PromptControls() {
    const template = useTemplateStore(state => state.template);
    const updatePrompt = useTemplateStore(state => state.updatePrompt);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('scene');

    if (!template) return null;

    const handleUpdate = (category: keyof StructuredPrompt, attribute: string, value: string) => {
        updatePrompt(category, attribute, value);
    };

    return (
        <div className={`${styles.card} h-full overflow-y-auto p-4`}>
            <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Visual DNA</h2>
            </div>

            <div className="space-y-2">
                {CATEGORIES.map(({ key, label }) => (
                    <div key={key} className="border border-slate-200/50 rounded-lg overflow-hidden bg-white/30">
                        <button
                            onClick={() => setExpandedCategory(expandedCategory === key ? null : key)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white/50 transition-colors"
                        >
                            <span className="font-medium text-slate-700">{label}</span>
                            {expandedCategory === key ? (
                                <ChevronDown className="w-4 h-4 text-slate-500" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            )}
                        </button>

                        {expandedCategory === key && (
                            <div className="p-3 pt-0 space-y-3">
                                {Object.entries(template.structured_prompt[key]).map(([attr, value]) => (
                                    <div key={attr}>
                                        <label className="block text-xs font-medium text-slate-500 mb-1 capitalize">
                                            {attr.replace(/_/g, ' ')}
                                        </label>
                                        {typeof value === 'boolean' ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => handleUpdate(key, attr, e.target.checked as any)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-slate-700">{value ? 'Enabled' : 'Disabled'}</span>
                                            </div>
                                        ) : Array.isArray(value) ? (
                                            <input
                                                type="text"
                                                value={value.join(', ')}
                                                onChange={(e) => handleUpdate(key, attr, e.target.value.split(',').map(s => s.trim()))}
                                                className="w-full px-2 py-1.5 text-sm bg-white/50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={value as string}
                                                onChange={(e) => handleUpdate(key, attr, e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm bg-white/50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
