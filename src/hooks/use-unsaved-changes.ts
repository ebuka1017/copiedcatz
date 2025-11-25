'use client';

import { useEffect } from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';

export function useUnsavedChanges() {
    const canUndo = useTemplateStore(state => state.canUndo());

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (canUndo) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [canUndo]);
}
