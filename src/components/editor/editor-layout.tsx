'use client';

import { Button } from '@/components/ui/button';
import { useTemplateStore } from '@/lib/stores/template-store';
import { ArrowLeft, Download, Save, Undo, Redo } from 'lucide-react';
import Link from 'next/link';

import { useUnsavedChanges } from '@/hooks/use-unsaved-changes';

interface EditorLayoutProps {
    children: React.ReactNode;
}

export function EditorLayout({ children }: EditorLayoutProps) {
    const { canvasUndo, canvasRedo, canCanvasUndo, canCanvasRedo, saveTemplate, isGenerating } = useTemplateStore();
    useUnsavedChanges();

    return (
        <div className="min-h-screen flex flex-col bg-slate-950">
            {/* Header */}
            <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
                <div className="h-full max-w-[1920px] mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="secondary" className="!p-2">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="font-semibold text-white">
                            Template Editor
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={canvasUndo}
                            disabled={!canCanvasUndo()}
                            title="Undo (Cmd+Z)"
                        >
                            <Undo className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={canvasRedo}
                            disabled={!canCanvasRedo()}
                            title="Redo (Cmd+Shift+Z)"
                        >
                            <Redo className="w-4 h-4" />
                        </Button>
                        <div className="w-px h-6 bg-slate-700 mx-2" />
                        <Button variant="secondary" onClick={() => saveTemplate()}>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button disabled={isGenerating}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
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
