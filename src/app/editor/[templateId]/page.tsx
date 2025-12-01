'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTemplateStore } from '@/lib/stores/template-store';
import { EditorLayout } from '@/components/editor/editor-layout';
import { Canvas } from '@/components/editor/canvas';
import { Controls } from '@/components/editor/controls';
import { useTemplateKeyboardShortcuts } from '@/lib/hooks/use-template-shortcuts';

export default function EditorPage() {
    const params = useParams();
    const { loadTemplate, template } = useTemplateStore();

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
            <div className="flex h-full gap-6">
                {/* Left: Canvas (Image Preview) */}
                <div className="flex-1 min-w-0">
                    <Canvas />
                </div>

                {/* Right: Controls (Visual DNA) */}
                <div className="w-[400px] flex-shrink-0">
                    <Controls />
                </div>
            </div>
        </EditorLayout>
    );
}
