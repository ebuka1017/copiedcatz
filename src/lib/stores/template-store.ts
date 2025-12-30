import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { debounce } from 'lodash-es';
import { useEffect, useState } from 'react';
import { generateImageV2 } from '@/lib/bria/client';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Safe deep clone that works with plain objects (unlike deepClone which can fail)
function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

import { StructuredPrompt } from '@/lib/bria/types';
export type { StructuredPrompt };

// Legacy definition removed in favor of Bria V2
// export interface StructuredPrompt { ... }


export interface Variation {
    id: string;
    image_url: string;
    seed: number;
    modified_prompt: StructuredPrompt;
    generation_time_ms: number;
    created_at: Date;
}

export interface Template {
    id: string;
    user_id: string;
    name: string;
    original_image_url: string;
    structured_prompt: StructuredPrompt;
    variations: Variation[];
    folder_id: string | null;
    is_public: boolean;
    tags: string[];
    created_at: Date;
    updated_at: Date;
}

interface HistoryState {
    prompt: StructuredPrompt;
    timestamp: number;
}

interface TemplateState {
    // Current state
    template: Template | null;
    isExtracting: boolean;
    isGenerating: boolean;
    extractionProgress: number;

    // Canvas history (which variation is displayed)
    currentVariationIndex: number; // -1 means show original, 0+ means show variations[index]

    // Prompt history management (50-step circular buffer) - for editing tools
    history: HistoryState[];
    historyIndex: number;
    maxHistoryLength: number;

    // Actions
    setTemplate: (template: Template) => void;
    setStructuredPrompt: (prompt: StructuredPrompt) => void;
    updatePrompt: (
        category: keyof StructuredPrompt,
        attribute: string | number, // Updated to allow array indices or specific fields
        value: any
    ) => void;
    batchUpdatePrompt: (updates: Array<{
        category: keyof StructuredPrompt;
        attribute: string;
        value: any;
    }>) => void;

    // Extraction
    setExtractionProgress: (progress: number) => void;

    // Generation
    generateVariation: (seed?: number) => Promise<Variation>;
    deleteVariation: (variationId: string) => void;

    // Canvas History (variation navigation - separate from editing tools)
    canvasUndo: () => void;
    canvasRedo: () => void;
    canCanvasUndo: () => boolean;
    canCanvasRedo: () => boolean;
    goToVariation: (index: number) => void;

    // Prompt History (for editing tools)
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clearHistory: () => void;

    // Persistence
    saveTemplate: () => Promise<void>;
    loadTemplate: (id: string) => Promise<void>;
    deleteTemplate: () => Promise<void>;

    // Utility
    reset: () => void;

    // Internal
    _pushHistory: () => void;
    _debouncedPushHistory: any; // Typed as any to avoid complex Lodash types in interface

    // Remix
    remixTemplate: (templateId: string) => Promise<string>;
    addVariation: (variation: Variation) => void;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

const initialState = {
    template: null,
    isExtracting: false,
    isGenerating: false,
    extractionProgress: 0,
    currentVariationIndex: -1, // -1 = original image, 0+ = variation index
    history: [],
    historyIndex: -1,
    maxHistoryLength: 15, // Reduced from 50 to optimize memory with deep clones
};

export const useTemplateStore = create<TemplateState>()(
    devtools(
        persist(
            subscribeWithSelector(
                immer((set, get) => ({
                    ...initialState,

                    // Initialize debounced function
                    _debouncedPushHistory: debounce(() => get()._pushHistory(), 1000),

                    // ==================================================================
                    // CORE ACTIONS
                    // ==================================================================

                    // ==================================================================
                    // HISTORY ACTIONS (Internal)
                    // ==================================================================

                    _pushHistory: () => {
                        set((state) => {
                            if (!state.template) return;

                            // Check if current state is different from last history state to avoid duplicates
                            const lastHistory = state.history[state.historyIndex];
                            const currentPrompt = state.template.structured_prompt;

                            // Simple JSON comparison (could be optimized)
                            if (JSON.stringify(lastHistory?.prompt) === JSON.stringify(currentPrompt)) {
                                return;
                            }

                            const newHistory = state.history.slice(0, state.historyIndex + 1);
                            newHistory.push({
                                prompt: deepClone(currentPrompt),
                                timestamp: Date.now()
                            });

                            if (newHistory.length > state.maxHistoryLength) {
                                newHistory.shift();
                            } else {
                                state.historyIndex++;
                            }

                            state.history = newHistory;
                        });
                    },

                    // ==================================================================
                    // CORE ACTIONS
                    // ==================================================================

                    setTemplate: (template) => {
                        set((state) => {
                            state.template = template;
                            // Initialize canvas index to latest variation (or -1 if none)
                            state.currentVariationIndex = template.variations.length > 0
                                ? template.variations.length - 1
                                : -1;
                            // Initialize history with first state
                            state.history = [{
                                prompt: deepClone(template.structured_prompt),
                                timestamp: Date.now()
                            }];
                            state.historyIndex = 0;
                        });
                        // Cancel any pending history pushes from previous template
                        get()._debouncedPushHistory?.cancel();
                    },

                    setStructuredPrompt: (prompt) => {
                        set((state) => {
                            if (!state.template) return;
                            state.template.structured_prompt = prompt;
                            state.template.updated_at = new Date();
                        });
                        get()._debouncedPushHistory();
                    },

                    updatePrompt: (category, attribute, value) => {
                        set((state) => {
                            if (!state.template) return;
                            const categoryObj = state.template.structured_prompt[category] as any;
                            categoryObj[attribute] = value;
                            state.template.updated_at = new Date();
                        });
                        get()._debouncedPushHistory();
                    },

                    batchUpdatePrompt: (updates) => {
                        set((state) => {
                            if (!state.template) return;
                            updates.forEach(({ category, attribute, value }) => {
                                const categoryObj = state.template!.structured_prompt[category] as any;
                                categoryObj[attribute] = value;
                            });
                            state.template.updated_at = new Date();
                        });
                        get()._debouncedPushHistory();
                    },

                    // ==================================================================
                    // EXTRACTION HELPERS
                    // ==================================================================

                    setExtractionProgress: (progress) => {
                        set({ extractionProgress: progress });
                    },

                    // ==================================================================
                    // GENERATION
                    // ==================================================================

                    generateVariation: async (seed) => {
                        const { template } = get();
                        if (!template) throw new Error('No template loaded');

                        set({ isGenerating: true });

                        try {
                            const actualSeed = seed ?? Math.floor(Math.random() * 1000000);
                            const startTime = Date.now();
                            console.log('[generateVariation] Starting generation with seed:', actualSeed);

                            // Call edge function directly from client (has session access)
                            const result = await generateImageV2({
                                structured_prompt: template.structured_prompt,
                                seed: actualSeed,
                                sync: true
                            });

                            console.log('[generateVariation] Edge function response:', result);
                            const generationTime = Date.now() - startTime;

                            // Extract image URL from result
                            let imageUrl: string;
                            if (result.image_url) {
                                imageUrl = result.image_url;
                            } else if (result.result && result.result.length > 0) {
                                imageUrl = result.result[0].url;
                            } else {
                                console.error('[generateVariation] No image_url in result:', result);
                                throw new Error('No image returned from Bria');
                            }

                            console.log('[generateVariation] Extracted image URL:', imageUrl);

                            // Save variation to database via API
                            const response = await fetch('/api/variations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    template_id: template.id,
                                    image_url: imageUrl,
                                    seed: actualSeed,
                                    structured_prompt: template.structured_prompt,
                                    generation_time_ms: generationTime,
                                }),
                            });

                            if (!response.ok) {
                                const error = await response.json();
                                console.error('[generateVariation] Save variation failed:', error);
                                throw new Error(error.message || 'Failed to save variation');
                            }

                            const variation: Variation = await response.json();
                            console.log('[generateVariation] Saved variation:', variation);

                            set((state) => {
                                if (state.template) {
                                    state.template.variations.push(variation);
                                    // Set canvas to show the new variation
                                    state.currentVariationIndex = state.template.variations.length - 1;
                                    console.log('[generateVariation] Updated variations count:', state.template.variations.length);
                                }
                            });

                            return variation;

                        } catch (error) {
                            console.error('[generateVariation] Failed:', error);
                            throw error;
                        } finally {
                            set({ isGenerating: false });
                        }
                    },

                    deleteVariation: (variationId) => {
                        set((state) => {
                            if (state.template) {
                                state.template.variations = state.template.variations.filter(
                                    (v) => v.id !== variationId
                                );
                            }
                        });
                    },

                    addVariation: (variation) => {
                        set((state) => {
                            if (state.template) {
                                state.template.variations.push(variation);
                                state.currentVariationIndex = state.template.variations.length - 1;
                                state.template.updated_at = new Date();
                            }
                        });
                    },

                    // ==================================================================
                    // CANVAS HISTORY (Variation Navigation)
                    // ==================================================================

                    canvasUndo: () => {
                        const { currentVariationIndex } = get();
                        // Can go back if we're not already at the original (-1)
                        if (currentVariationIndex > -1) {
                            set({ currentVariationIndex: currentVariationIndex - 1 });
                        }
                    },

                    canvasRedo: () => {
                        const { currentVariationIndex, template } = get();
                        if (!template) return;
                        // Can go forward if we're not at the latest variation
                        const maxIndex = template.variations.length - 1;
                        if (currentVariationIndex < maxIndex) {
                            set({ currentVariationIndex: currentVariationIndex + 1 });
                        }
                    },

                    canCanvasUndo: () => {
                        return get().currentVariationIndex > -1;
                    },

                    canCanvasRedo: () => {
                        const { currentVariationIndex, template } = get();
                        if (!template) return false;
                        return currentVariationIndex < template.variations.length - 1;
                    },

                    goToVariation: (index: number) => {
                        const { template } = get();
                        if (!template) return;
                        // Clamp index to valid range: -1 to variations.length - 1
                        const clampedIndex = Math.max(-1, Math.min(index, template.variations.length - 1));
                        set({ currentVariationIndex: clampedIndex });
                    },

                    // ==================================================================
                    // PROMPT HISTORY (for editing tools)
                    // ==================================================================

                    undo: () => {
                        get()._debouncedPushHistory?.cancel();
                        const { history, historyIndex } = get();

                        if (historyIndex > 0) {
                            const newIndex = historyIndex - 1;
                            set((state) => {
                                if (state.template) {
                                    state.template.structured_prompt = deepClone(
                                        history[newIndex].prompt
                                    );
                                    state.template.updated_at = new Date();
                                }
                                state.historyIndex = newIndex;
                            });
                        }
                    },

                    redo: () => {
                        get()._debouncedPushHistory?.cancel();
                        const { history, historyIndex } = get();

                        if (historyIndex < history.length - 1) {
                            const newIndex = historyIndex + 1;
                            set((state) => {
                                if (state.template) {
                                    state.template.structured_prompt = deepClone(
                                        history[newIndex].prompt
                                    );
                                    state.template.updated_at = new Date();
                                }
                                state.historyIndex = newIndex;
                            });
                        }
                    },

                    canUndo: () => get().historyIndex > 0,

                    canRedo: () => get().historyIndex < get().history.length - 1,

                    clearHistory: () => {
                        set((state) => {
                            if (state.template) {
                                state.history = [{
                                    prompt: deepClone(state.template.structured_prompt),
                                    timestamp: Date.now()
                                }];
                                state.historyIndex = 0;
                            }
                        });
                    },

                    // ==================================================================
                    // PERSISTENCE
                    // ==================================================================

                    saveTemplate: async () => {
                        const { template } = get();
                        if (!template) return;

                        const response = await fetch(`/api/templates/${template.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(template),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Save failed');
                        }
                    },

                    loadTemplate: async (id) => {
                        const response = await fetch(`/api/templates/${id}`);

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Load failed');
                        }

                        const template = await response.json();
                        get().setTemplate(template);
                    },

                    deleteTemplate: async () => {
                        const { template } = get();
                        if (!template) return;

                        const response = await fetch(`/api/templates/${template.id}`, {
                            method: 'DELETE',
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Delete failed');
                        }

                        get().reset();
                    },

                    remixTemplate: async (templateId) => {
                        const response = await fetch(`/api/templates/${templateId}/clone`, {
                            method: 'POST',
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'Remix failed');
                        }

                        const newTemplate = await response.json();
                        return newTemplate.id;
                    },

                    // ==================================================================
                    // UTILITY
                    // ==================================================================

                    reset: () => {
                        set(initialState);
                    },
                }))
            ),
            {
                name: 'copiedcatz-storage',
                // Only persist template, not transient state
                partialize: (state) => ({
                    template: state.template,
                    currentVariationIndex: state.currentVariationIndex,
                    history: state.history,
                    historyIndex: state.historyIndex,
                }),
            }
        ),
        { name: 'CopiedcatzStore' }
    )
);

// ============================================================================
// AUTO-SAVE MIDDLEWARE
// ============================================================================

const debouncedSave = debounce(async (template: Template) => {
    try {
        await fetch(`/api/templates/${template.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(template),
        });
    } catch (error) {
        console.error('Auto-save failed:', error);
    }
}, 30000); // 30 seconds

// Subscribe to template changes for auto-save
useTemplateStore.subscribe(
    (state) => state.template,
    (template) => {
        if (template) {
            debouncedSave(template);
        }
    }
);

// ============================================================================
// KEYBOARD SHORTCUTS HOOK
// ============================================================================

export function useTemplateKeyboardShortcuts() {
    const {
        canvasUndo, canvasRedo, canCanvasUndo, canCanvasRedo,
        saveTemplate
    } = useTemplateStore();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Cmd/Ctrl + Z: Canvas Undo (go to previous variation)
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canCanvasUndo()) canvasUndo();
            }

            // Cmd/Ctrl + Shift + Z: Canvas Redo (go to next variation)
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
                e.preventDefault();
                if (canCanvasRedo()) canvasRedo();
            }

            // Cmd/Ctrl + S: Save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                saveTemplate();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvasUndo, canvasRedo, canCanvasUndo, canCanvasRedo, saveTemplate]);
}

// ============================================================================
// OPTIMISTIC UI HOOK
// ============================================================================

export function useOptimisticGeneration() {
    const { isGenerating } = useTemplateStore();
    const [optimisticVariation, setOptimisticVariation] = useState<string | null>(null);

    useEffect(() => {
        if (isGenerating) {
            // Show skeleton immediately
            setOptimisticVariation('generating...');
        } else {
            setOptimisticVariation(null);
        }
    }, [isGenerating]);

    return optimisticVariation;
}
