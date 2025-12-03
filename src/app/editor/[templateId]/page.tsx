'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTemplateStore } from '@/lib/stores/template-store';
import { EditorLayout } from '@/components/editor/editor-layout';
import { Canvas } from '@/components/editor/canvas';
import { PromptControls } from '@/components/editor/prompt-controls';
import { useTemplateKeyboardShortcuts } from '@/lib/hooks/use-template-shortcuts';
import { Settings, X } from 'lucide-react';

export default function EditorPage() {
    const params = useParams();
    const { loadTemplate, template } = useTemplateStore();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Enable keyboard shortcuts
    useTemplateKeyboardShortcuts();

    useEffect(() => {
        if (params.templateId && typeof params.templateId === 'string') {
            // In a real app, we'd load from API
            loadTemplate(params.templateId);

            // For now, if we don't have a template in store, we might redirect or show error
            // But since we just came from extraction, it might be there.
        }
    }, [params.templateId, loadTemplate]);

    if (!template) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Loading template...</p>
            </div>
        );
    }

    return (
        <EditorLayout>
            <div className="flex flex-col md:flex-row h-full gap-6 relative">
                {/* Mobile Toggle */}
                <div className="md:hidden flex justify-end mb-2">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium"
                    >
                        <Settings className="w-4 h-4" />
                        Edit Visual DNA
                    </button>
                </div>

                {/* Left: Canvas (Image Preview) */}
                <div className="flex-1 min-w-0 h-[60vh] md:h-auto">
                    <Canvas />
                </div>

                {/* Desktop Sidebar */}
                <div className="hidden md:block w-[400px] flex-shrink-0">
                    <PromptControls />
                </div>

                {/* Mobile Drawer */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <div
                            className="absolute right-0 top-0 h-full w-[85%] max-w-[400px] bg-slate-900 border-l border-slate-800 p-4 overflow-y-auto shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-white">Visual DNA</h3>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <PromptControls />
                        </div>
                    </div>
                )}
            </div>
        </EditorLayout>
    );
}
