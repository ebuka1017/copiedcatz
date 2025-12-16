'use client';

import React from 'react';
import { useTemplateStore, useTemplateKeyboardShortcuts } from '@/lib/stores/template-store';
import { Undo2, Redo2, Save, Wand2 } from 'lucide-react';
import buttonStyles from '@/components/ui/glass-button.module.css';
import { useShallow } from 'zustand/react/shallow';

export function HistoryToolbar() {
    const {
        undo, redo, canUndo, canRedo,
        saveTemplate, generateVariation, isGenerating
    } = useTemplateStore(useShallow(state => ({
        undo: state.undo,
        redo: state.redo,
        canUndo: state.canUndo,
        canRedo: state.canRedo,
        saveTemplate: state.saveTemplate,
        generateVariation: state.generateVariation,
        isGenerating: state.isGenerating
    })));

    // Enable keyboard shortcuts
    useTemplateKeyboardShortcuts();

    return (
        <div className="h-16 flex items-center justify-between px-6 bg-white/50 backdrop-blur-md border-b border-white/20">
            <div className="flex items-center gap-2">
                <button
                    onClick={undo}
                    disabled={!canUndo()}
                    className="p-2 rounded-full hover:bg-white/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Undo (Cmd+Z)"
                >
                    <Undo2 className="w-5 h-5 text-slate-700" />
                </button>
                <button
                    onClick={redo}
                    disabled={!canRedo()}
                    className="p-2 rounded-full hover:bg-white/50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Redo (Cmd+Shift+Z)"
                >
                    <Redo2 className="w-5 h-5 text-slate-700" />
                </button>
                <div className="w-px h-6 bg-slate-300 mx-2" />
                <button
                    onClick={() => saveTemplate()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/50 text-sm font-medium text-slate-700 transition-colors"
                    title="Save (Cmd+S)"
                >
                    <Save className="w-4 h-4" />
                    Save
                </button>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => generateVariation()}
                    disabled={isGenerating}
                    className={`${buttonStyles.button} !bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none text-white shadow-lg shadow-blue-500/20`}
                >
                    <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    {isGenerating ? 'Generating...' : 'Generate Variation'}
                </button>
            </div>
        </div>
    );
}
