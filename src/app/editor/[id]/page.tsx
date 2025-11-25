'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTemplateStore } from '@/lib/stores/template-store';
import { HistoryToolbar } from '@/components/editor/history-toolbar';
import { PromptControls } from '@/components/editor/prompt-controls';
import { ImagePreview } from '@/components/editor/image-preview';
import { Loader2 } from 'lucide-react';

export default function EditorPage() {
    const params = useParams();
    const { loadTemplate, template } = useTemplateStore();

    useEffect(() => {
        if (params?.id) {
            loadTemplate(params.id as string).catch(console.error);
        }
    }, [params?.id, loadTemplate]);

    if (!template) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <HistoryToolbar />

            <main className="flex-1 flex overflow-hidden p-4 gap-4">
                {/* Left Panel: Controls */}
                <div className="w-80 flex-shrink-0">
                    <PromptControls />
                </div>

                {/* Right Panel: Preview */}
                <div className="flex-1">
                    <ImagePreview />
                </div>
            </main>
        </div>
    );
}
