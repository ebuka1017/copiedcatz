'use client';

import React, { useState } from 'react';
import { ObjectDescription } from '@/lib/bria/types';
import { ChevronDown, ChevronUp, Trash2, GripVertical, User, Box, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ObjectCardProps {
    object: ObjectDescription;
    index: number;
    onChange: (index: number, field: keyof ObjectDescription, value: string) => void;
    onDelete: (index: number) => void;
}

export function ObjectCard({ object, index, onChange, onDelete }: ObjectCardProps) {
    const [expanded, setExpanded] = useState(index === 0); // First object expanded by default

    // Determine icon based on description keywords
    const getIcon = () => {
        const desc = object.description?.toLowerCase() || '';
        if (desc.includes('person') || desc.includes('man') || desc.includes('woman') || desc.includes('human')) {
            return <User className="w-4 h-4" />;
        }
        return <Box className="w-4 h-4" />;
    };

    // Generate a friendly label
    const getLabel = () => {
        if (object.description) {
            const words = object.description.split(' ').slice(0, 3).join(' ');
            return words.length > 25 ? words.substring(0, 25) + '...' : words;
        }
        return `Object ${index + 1}`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden"
        >
            {/* Header - Always visible */}
            <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-800/80 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="text-slate-500 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                </div>

                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    {getIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate">{getLabel()}</h4>
                    <p className="text-xs text-slate-500 truncate">
                        {object.location || 'No position set'} • {object.relative_size || 'Size not set'}
                    </p>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(index);
                    }}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>

                <div className="text-slate-500">
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {/* Expanded content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-700"
                    >
                        <div className="p-4 space-y-4">
                            {/* Description */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                    What is this?
                                </label>
                                <input
                                    type="text"
                                    value={object.description || ''}
                                    onChange={(e) => onChange(index, 'description', e.target.value)}
                                    placeholder="e.g., A golden retriever dog"
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>

                            {/* Position & Size - Side by side */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Position
                                    </label>
                                    <select
                                        value={object.location || ''}
                                        onChange={(e) => onChange(index, 'location', e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select...</option>
                                        <option value="center">Center</option>
                                        <option value="left foreground">Left Foreground</option>
                                        <option value="right foreground">Right Foreground</option>
                                        <option value="left background">Left Background</option>
                                        <option value="right background">Right Background</option>
                                        <option value="top">Top</option>
                                        <option value="bottom">Bottom</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                        Size
                                    </label>
                                    <select
                                        value={object.relative_size || ''}
                                        onChange={(e) => onChange(index, 'relative_size', e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Select...</option>
                                        <option value="very small">Very Small</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                        <option value="very large">Very Large</option>
                                        <option value="fills frame">Fills Frame</option>
                                    </select>
                                </div>
                            </div>

                            {/* Appearance */}
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                    Colors & Shape
                                </label>
                                <input
                                    type="text"
                                    value={object.shape_and_color || ''}
                                    onChange={(e) => onChange(index, 'shape_and_color', e.target.value)}
                                    placeholder="e.g., Golden fur, fluffy, sitting posture"
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors"
                                />
                            </div>

                            {/* Additional Details - Collapsible */}
                            <details className="group">
                                <summary className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300">
                                    <Sparkles className="w-3 h-3" />
                                    More details
                                    <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="mt-3 space-y-3 pl-5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                            Texture
                                        </label>
                                        <input
                                            type="text"
                                            value={object.texture || ''}
                                            onChange={(e) => onChange(index, 'texture', e.target.value)}
                                            placeholder="e.g., Soft, smooth, rough"
                                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                            Relationship
                                        </label>
                                        <input
                                            type="text"
                                            value={object.relationship || ''}
                                            onChange={(e) => onChange(index, 'relationship', e.target.value)}
                                            placeholder="e.g., Main subject, background element"
                                            className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </details>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
