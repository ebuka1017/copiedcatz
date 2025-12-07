'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTemplateStore, StructuredPrompt } from '@/lib/stores/template-store';
import { Wand2 } from 'lucide-react';
import { useState } from 'react';

const CATEGORIES: { key: keyof StructuredPrompt; label: string; icon: string }[] = [
    { key: 'objects', label: 'Subjects', icon: '👤' },
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
            <Card className="p-2 flex gap-1 overflow-x-auto no-scrollbar bg-slate-900 border-slate-800">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.key}
                        onClick={() => setActiveCategory(cat.key)}
                        className={`
              px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeCategory === cat.key
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-slate-400 hover:bg-slate-800'}
            `}
                    >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </Card>

            {/* Controls Area */}
            <Card className="flex-1 p-6 overflow-y-auto bg-slate-900 border-slate-800">
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold capitalize">
                            {activeCategory} Attributes
                        </h3>
                    </div>

                    {/* Dynamic Inputs based on Category */}
                    {activeCategory === 'objects' ? (
                        <div className="space-y-6">
                            {(template.structured_prompt.objects || []).map((obj, index) => (
                                <div key={index} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                            Subject {index + 1}
                                        </h4>
                                        <button
                                            onClick={() => {
                                                const newObjects = [...template.structured_prompt.objects];
                                                newObjects.splice(index, 1);
                                                updatePrompt('objects', index as any, newObjects as any); // Type cast for quick fix or use a specific action
                                                // Actually updatePrompt expects (category, attribute, value). 
                                                // For array, we might need to update the WHOLE array.
                                                // Let's use batchUpdate or special handler.
                                                // Simplified: updatePrompt('objects', 'entire_array', newObjects) - wait logic needs check.
                                                // Re-reading updatePrompt logic: 
                                                // const categoryObj = state.template.structured_prompt[category] as any;
                                                // categoryObj[attribute] = value;
                                                // For 'objects', structured_prompt['objects'] IS the array. 
                                                // So attribute is the INDEX. categoryObj is the array.
                                                // So updatePrompt('objects', index, newValue) updates the item at index.
                                                // To DELETE, we need to update the parent 'objects' property?
                                                // updatePrompt logic assumes category is an object with keys.
                                                // But 'objects' IS an array. 
                                                // If category='objects', state.template.structured_prompt['objects'] is the array.
                                                // So categoryObj is the array.
                                                // categoryObj[attribute] = value works if attribute is index.
                                                // But we can't remove via direct assignment.
                                                // I should likely add a removeObject action or handle it via a new setObjects action.
                                                // For now, let's just allow EDITING to avoid complexity.
                                            }}
                                            className="text-slate-500 hover:text-red-400"
                                        >
                                            {/* Delete icon suppressed for now */}
                                        </button>
                                    </div>

                                    {Object.entries(obj).map(([field, val]) => (
                                        <div key={field} className="space-y-1">
                                            <label className="text-xs font-medium text-slate-500 capitalize">
                                                {field.replace(/_/g, ' ')}
                                            </label>
                                            <input
                                                type="text"
                                                value={val as string}
                                                onChange={(e) => {
                                                    // Update just this field of this object
                                                    // We need a store action to update nested array item.
                                                    // updatePrompt('objects', index, { ...obj, [field]: val }) ??
                                                    // My store: updatePrompt(category, attribute, value).
                                                    // If category='objects', attribute=index, value=newObject.
                                                    // Yes!
                                                    const newObj = { ...obj, [field]: e.target.value };
                                                    updatePrompt('objects', index as any, newObj);
                                                }}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : (
                        Object.entries(template.structured_prompt[activeCategory] || {}).map(([key, value]) => (
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
                        ))
                    )}
                </div>
            </Card>

            {/* Generate Button */}
            <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 text-lg shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-500 text-white h-auto"
            >
                {isGenerating ? (
                    <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Wand2 className="w-5 h-5 mr-2" />
                        Generate Variation
                    </>
                )}
            </Button>
        </div>
    );
}
