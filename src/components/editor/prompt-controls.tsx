'use client';

import React, { useState } from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';
import { StructuredPrompt, ObjectDescription } from '@/lib/bria/types';
import { StructuredPromptEditor } from '@/components/editor/StructuredPromptEditor';
import { MagicPromptDialog } from '@/components/editor/magic-prompt-dialog';
import { ObjectCard } from '@/components/editor/object-card';
import { NaturalLanguageEdit } from '@/components/editor/natural-language-edit';
import { Settings, Code, Type, Sparkles, Plus, Camera, Sun, Palette, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';

export function PromptControls() {
    const template = useTemplateStore(state => state.template);
    const updatePrompt = useTemplateStore(state => state.updatePrompt);
    const setStructuredPrompt = useTemplateStore(state => state.setStructuredPrompt);
    const generateVariation = useTemplateStore(state => state.generateVariation);
    const isGenerating = useTemplateStore(state => state.isGenerating);
    const [mode, setMode] = useState<'simple' | 'advanced'>('simple');
    const [activeTab, setActiveTab] = useState<'objects' | 'camera' | 'lighting' | 'style'>('objects');

    if (!template) return null;

    const prompt = template.structured_prompt as unknown as StructuredPrompt;

    const handleNestedUpdate = (category: keyof StructuredPrompt, attribute: string, value: any) => {
        updatePrompt(category, attribute, value);
    };

    const handleAdvancedUpdate = (newPrompt: StructuredPrompt) => {
        setStructuredPrompt(newPrompt);
    };

    // Object management
    const handleObjectChange = (index: number, field: keyof ObjectDescription, value: string) => {
        const newObjects = [...(prompt.objects || [])];
        newObjects[index] = { ...newObjects[index], [field]: value };
        setStructuredPrompt({ ...prompt, objects: newObjects });
    };

    const handleObjectDelete = (index: number) => {
        const newObjects = [...(prompt.objects || [])];
        newObjects.splice(index, 1);
        setStructuredPrompt({ ...prompt, objects: newObjects });
    };

    const handleAddObject = () => {
        const newObject: ObjectDescription = {
            description: '',
            location: 'center',
            relationship: 'primary subject',
            relative_size: 'medium',
            shape_and_color: '',
        };
        setStructuredPrompt({
            ...prompt,
            objects: [...(prompt.objects || []), newObject]
        });
    };

    const tabs = [
        { id: 'objects', label: 'Objects', icon: <Sparkles className="w-4 h-4" /> },
        { id: 'camera', label: 'Camera', icon: <Camera className="w-4 h-4" /> },
        { id: 'lighting', label: 'Lighting', icon: <Sun className="w-4 h-4" /> },
        { id: 'style', label: 'Style', icon: <Palette className="w-4 h-4" /> },
    ];

    return (
        <Card className="h-full flex flex-col overflow-hidden bg-slate-900 border-slate-800 rounded-none border-l">
            {/* Header */}
            <div className="p-4 border-b border-slate-700 flex flex-col gap-4 bg-slate-900/80">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-blue-500" />
                        <h2 className="text-lg font-semibold text-white">Visual DNA</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                const newStatus = !template.is_public;
                                useTemplateStore.setState(state => {
                                    if (state.template) state.template.is_public = newStatus;
                                });
                                useTemplateStore.getState().saveTemplate();
                            }}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors border ${template.is_public
                                ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                }`}
                        >
                            {template.is_public ? 'Public' : 'Private'}
                        </button>
                        <div className="flex bg-slate-800 rounded-full p-1">
                            <button
                                onClick={() => setMode('simple')}
                                className={`p-1.5 rounded-full transition-all ${mode === 'simple' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                title="Visual Mode"
                            >
                                <Type className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setMode('advanced')}
                                className={`p-1.5 rounded-full transition-all ${mode === 'advanced' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                title="JSON Mode"
                            >
                                <Code className="w-4 h-4" />
                            </button>
                        </div>
                        <MagicPromptDialog>
                            <button
                                className="p-2 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 hover:from-blue-500/30 hover:to-purple-500/30 transition-colors"
                                title="Magic Prompt (AI)"
                            >
                                <Wand2 className="w-4 h-4" />
                            </button>
                        </MagicPromptDialog>
                    </div>
                </div>

                {/* Tabs - Only in simple mode */}
                {mode === 'simple' && (
                    <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                {tab.icon}
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {mode === 'simple' ? (
                    <div className="space-y-4">
                        {/* Natural Language Edit - Always visible */}
                        <NaturalLanguageEdit />

                        <div className="h-px bg-slate-700" />

                        <AnimatePresence mode="wait">
                            {activeTab === 'objects' && (
                                <motion.div
                                    key="objects"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-slate-300">Scene Objects</h3>
                                        <button
                                            onClick={handleAddObject}
                                            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add Object
                                        </button>
                                    </div>

                                    {prompt.objects?.length ? (
                                        prompt.objects.map((obj, index) => (
                                            <ObjectCard
                                                key={index}
                                                object={obj}
                                                index={index}
                                                onChange={handleObjectChange}
                                                onDelete={handleObjectDelete}
                                            />
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">No objects defined</p>
                                            <button
                                                onClick={handleAddObject}
                                                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                                            >
                                                Add your first object
                                            </button>
                                        </div>
                                    )}

                                    {/* Background Setting */}
                                    <div className="mt-4 space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Background</label>
                                        <textarea
                                            value={prompt.background_setting || ''}
                                            onChange={(e) => handleNestedUpdate('background_setting' as any, '', e.target.value)}
                                            className="w-full h-20 bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                            placeholder="Describe the background..."
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'camera' && (
                                <motion.div
                                    key="camera"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Camera Angle</label>
                                        <select
                                            value={prompt.photographic_characteristics?.camera_angle || ''}
                                            onChange={(e) => handleNestedUpdate('photographic_characteristics', 'camera_angle', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select angle...</option>
                                            <option value="Eye Level">Eye Level</option>
                                            <option value="Low Angle">Low Angle (Hero Shot)</option>
                                            <option value="High Angle">High Angle</option>
                                            <option value="Bird's Eye">Bird's Eye View</option>
                                            <option value="Dutch Angle">Dutch Angle (Tilted)</option>
                                            <option value="Close-up">Close-up</option>
                                            <option value="Wide Shot">Wide Shot</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Lens / Focal Length</label>
                                        <select
                                            value={prompt.photographic_characteristics?.lens_focal_length || ''}
                                            onChange={(e) => handleNestedUpdate('photographic_characteristics', 'lens_focal_length', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select lens...</option>
                                            <option value="14mm Ultra Wide">14mm Ultra Wide</option>
                                            <option value="24mm Wide">24mm Wide</option>
                                            <option value="35mm Standard Wide">35mm Standard Wide</option>
                                            <option value="50mm Standard">50mm Standard</option>
                                            <option value="85mm Portrait">85mm Portrait</option>
                                            <option value="135mm Telephoto">135mm Telephoto</option>
                                            <option value="200mm+ Super Telephoto">200mm+ Super Telephoto</option>
                                            <option value="Macro">Macro Lens</option>
                                            <option value="Fisheye">Fisheye</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Depth of Field</label>
                                        <select
                                            value={prompt.photographic_characteristics?.depth_of_field || ''}
                                            onChange={(e) => handleNestedUpdate('photographic_characteristics', 'depth_of_field', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select DoF...</option>
                                            <option value="Very Shallow (f/1.4)">Very Shallow - Dreamy Bokeh (f/1.4)</option>
                                            <option value="Shallow (f/2.8)">Shallow - Subject Isolation (f/2.8)</option>
                                            <option value="Medium (f/5.6)">Medium - Balanced (f/5.6)</option>
                                            <option value="Deep (f/11)">Deep - Landscape (f/11)</option>
                                            <option value="Very Deep (f/16+)">Very Deep - Everything Sharp (f/16+)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Focus</label>
                                        <input
                                            type="text"
                                            value={prompt.photographic_characteristics?.focus || ''}
                                            onChange={(e) => handleNestedUpdate('photographic_characteristics', 'focus', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            placeholder="e.g., Sharp on subject's eyes"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'lighting' && (
                                <motion.div
                                    key="lighting"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Lighting Type</label>
                                        <select
                                            value={prompt.lighting?.conditions || ''}
                                            onChange={(e) => handleNestedUpdate('lighting', 'conditions', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select lighting...</option>
                                            <option value="Natural Daylight">Natural Daylight</option>
                                            <option value="Golden Hour">Golden Hour (Warm)</option>
                                            <option value="Blue Hour">Blue Hour (Cool)</option>
                                            <option value="Overcast">Overcast (Soft)</option>
                                            <option value="Studio Softbox">Studio Softbox</option>
                                            <option value="Dramatic Spotlight">Dramatic Spotlight</option>
                                            <option value="Neon/Cyberpunk">Neon/Cyberpunk</option>
                                            <option value="Candlelight">Candlelight</option>
                                            <option value="Moonlight">Moonlight</option>
                                            <option value="HDR">HDR (High Dynamic Range)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Light Direction</label>
                                        <select
                                            value={prompt.lighting?.direction || ''}
                                            onChange={(e) => handleNestedUpdate('lighting', 'direction', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select direction...</option>
                                            <option value="Front">Front (Flat)</option>
                                            <option value="45 Degree">45 Degree (Classic)</option>
                                            <option value="Side">Side (Dramatic)</option>
                                            <option value="Backlit">Backlit (Silhouette)</option>
                                            <option value="Rim Light">Rim Light (Edge Glow)</option>
                                            <option value="Top Down">Top Down</option>
                                            <option value="Bottom Up">Bottom Up (Spooky)</option>
                                            <option value="Volumetric">Volumetric (God Rays)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Shadows</label>
                                        <input
                                            type="text"
                                            value={prompt.lighting?.shadows || ''}
                                            onChange={(e) => handleNestedUpdate('lighting', 'shadows', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            placeholder="e.g., Soft shadows, hard contrast"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'style' && (
                                <motion.div
                                    key="style"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="space-y-4"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Style & Medium</label>
                                        <select
                                            value={prompt.style_medium || ''}
                                            onChange={(e) => setStructuredPrompt({ ...prompt, style_medium: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select style...</option>
                                            <option value="Photography">Photography</option>
                                            <option value="Digital Art">Digital Art</option>
                                            <option value="Oil Painting">Oil Painting</option>
                                            <option value="Watercolor">Watercolor</option>
                                            <option value="3D Render">3D Render</option>
                                            <option value="Anime">Anime</option>
                                            <option value="Comic Book">Comic Book</option>
                                            <option value="Cinematic">Cinematic</option>
                                            <option value="Illustration">Illustration</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Mood & Atmosphere</label>
                                        <input
                                            type="text"
                                            value={prompt.aesthetics?.mood_atmosphere || ''}
                                            onChange={(e) => handleNestedUpdate('aesthetics', 'mood_atmosphere', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            placeholder="e.g., Dramatic, peaceful, energetic"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Color Scheme</label>
                                        <input
                                            type="text"
                                            value={prompt.aesthetics?.color_scheme || ''}
                                            onChange={(e) => handleNestedUpdate('aesthetics', 'color_scheme', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            placeholder="e.g., Warm earth tones, cool blues"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Composition</label>
                                        <select
                                            value={prompt.aesthetics?.composition || ''}
                                            onChange={(e) => handleNestedUpdate('aesthetics', 'composition', e.target.value)}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                        >
                                            <option value="">Select composition...</option>
                                            <option value="Rule of Thirds">Rule of Thirds</option>
                                            <option value="Centered">Centered / Symmetrical</option>
                                            <option value="Golden Ratio">Golden Ratio</option>
                                            <option value="Leading Lines">Leading Lines</option>
                                            <option value="Frame within Frame">Frame within Frame</option>
                                            <option value="Diagonal">Diagonal</option>
                                            <option value="Minimalist">Minimalist</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Artistic Style</label>
                                        <input
                                            type="text"
                                            value={prompt.artistic_style || ''}
                                            onChange={(e) => setStructuredPrompt({ ...prompt, artistic_style: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-600 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                            placeholder="e.g., Film noir, Wes Anderson, Blade Runner"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <StructuredPromptEditor
                        initialPrompt={prompt}
                        onChange={handleAdvancedUpdate}
                        className="h-full border-0 shadow-none !bg-transparent"
                    />
                )}
            </div>

            {/* Generate Button - Fixed at bottom */}
            <div className="p-4 border-t border-slate-700 bg-slate-900/80">
                <Button
                    onClick={() => generateVariation()}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none py-3 text-base font-semibold"
                >
                    {isGenerating ? (
                        <>
                            <Wand2 className="w-5 h-5 mr-2 animate-spin" />
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
        </Card>
    );
}
