import { useEffect } from 'react';
import { useTemplateStore } from '@/lib/stores/template-store';

export function useTemplateKeyboardShortcuts() {
    const { undo, redo, canUndo, canRedo, saveTemplate } = useTemplateStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + Z: Undo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo()) undo();
            }

            // Cmd/Ctrl + Shift + Z: Redo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                if (canRedo()) redo();
            }

            // Cmd/Ctrl + S: Save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveTemplate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, canUndo, canRedo, saveTemplate]);
}
