'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { GlassButton } from '@/components/ui/glass-button';
import { useTemplateStore, StructuredPrompt } from '@/lib/stores/template-store';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES: { key: keyof StructuredPrompt; label: string; icon: string }[] = [
    { key: 'lighting', label: 'Lighting', icon: '💡' },
    { key: 'photographic_characteristics', label: 'Camera', icon: '📷' },
    { key: 'aesthetics', label: 'Aesthetics', icon: '🎨' },
    { key: 'artistic_style', label: 'Style', icon: '✨' },
    { key: 'background_setting', label: 'Background', icon: '🌄' },
];

export function Controls() {
    const { template, updatePrompt, generateVariation, isGenerating } = useTemplateStore();
    const [activeCategory, setActiveCategory] = useState<keyof StructuredPrompt>('lighting');

    if (!template) return null;

    const handleGenerate = async () => {
        try {
            await generateVariation();
        } catch (error) {
            // Error handling would go here (toast)
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Category Navigation */}
            <GlassCard className="p-2 flex gap-1 overflow-x-auto no-scrollbar">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeCategory === cat.key
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
            `}
                    >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </GlassCard>

            {/* Controls Area */}
            <GlassCard className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold capitalize">
                            {activeCategory} Attributes
                        </h3>
                    </div>

                    {/* Dynamic Inputs based on Category */}
                    {Object.entries(template.structured_prompt[activeCategory] || {}).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                                {key.replace(/_/g, ' ')}
                            </label>

                            {typeof value === 'boolean' ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => updatePrompt(activeCategory, key, !value)}
                                        className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${value ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}
                    `}
                                    >
                                        <div
                                            className={`
                        absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                        ${value ? 'left-7' : 'left-1'}
                      `}
                                        />
                                    </button>
                                    <span className="text-sm text-slate-500">
                                        {value ? 'Enabled' : 'Disabled'}
                                    </span>
                                </div>
                            ) : Array.isArray(value) ? (
                                <div className="flex flex-wrap gap-2">
                                    {value.map((item, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                    {/* Add item button would go here */}
                                </div>
                            ) : (
                                <input
                                    type="text"
                                    value={value as string}
                                    onChange={(e) => updatePrompt(activeCategory, key, e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </GlassCard>

            {/* Generate Button */}
            <GlassButton
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 text-lg shadow-xl shadow-blue-500/20"
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-5 h-5" />
                        Generate Variation
                    </>
                )}
            </GlassButton>
        </div>
    );
}
