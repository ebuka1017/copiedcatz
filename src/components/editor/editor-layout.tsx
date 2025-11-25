'use client';

import { GlassButton } from '@/components/ui/glass-button';
import { useTemplateStore } from '@/lib/stores/template-store';
import { ArrowLeft, Download, Save, Undo, Redo } from 'lucide-react';
import Link from 'next/link';

interface EditorLayoutProps {
    children: React.ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
    const { undo, redo, canUndo, canRedo, saveTemplate, isGenerating } = useTemplateStore();

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="h-full max-w-[1920px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <GlassButton variant="secondary" className="!p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </GlassButton>
                        </Link>
                        <h1 className="font-semibold text-slate-900 dark:text-white">
                            Template Editor
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <GlassButton
                            variant="secondary"
                            onClick={undo}
                            disabled={!canUndo()}
                            title="Undo (Cmd+Z)"
                        >
                            <Undo className="w-4 h-4" />
                        </GlassButton>
                        <GlassButton
                            variant="secondary"
                            onClick={redo}
                            disabled={!canRedo()}
                            title="Redo (Cmd+Shift+Z)"
                        >
                            <Redo className="w-4 h-4" />
                        </GlassButton>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                        <GlassButton variant="secondary" onClick={() => saveTemplate()}>
                            <Save className="w-4 h-4" />
                            Save
                        </GlassButton>
                        <GlassButton disabled={isGenerating}>
                            <Download className="w-4 h-4" />
                            Export
                        </GlassButton>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 max-w-[1920px] mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
