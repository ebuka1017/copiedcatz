import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { debounce } from 'lodash-es';
import { useEffect, useState } from 'react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface StructuredPrompt {
    scene: {
        description: string;
        environment: string;
        atmosphere: string;
    };
    lighting: {
        type: string;
        direction: string;
        intensity: string;
        color_temperature: string;
    };
    camera: {
        angle: string;
        focal_length: string;
        field_of_view: string;
        depth_of_field: string;
    };
    composition: {
        rule_of_thirds: boolean;
        symmetry: string;
        balance: string;
        leading_lines: boolean;
    };
    color: {
        palette: string[];
        saturation: string;
        contrast: string;
        tone: string;
    };
    style: {
        aesthetic: string;
        mood: string;
        genre: string;
        period: string;
    };
    technical: {
        resolution: string;
        quality: string;
        grain: string;
        sharpness: string;
    };
}

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

    // History management (50-step circular buffer)
    history: HistoryState[];
    historyIndex: number;
    maxHistoryLength: number;

    // Actions
    setTemplate: (template: Template) => void;
    updatePrompt: (
        category: keyof StructuredPrompt,
        attribute: string,
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

    // History
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
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

const initialState = {
    template: null,
    isExtracting: false,
    isGenerating: false,
    extractionProgress: 0,
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

                    // ==================================================================
                    // CORE ACTIONS
                    // ==================================================================

                    setTemplate: (template) => {
                        set((state) => {
                            state.template = template;
                            // Initialize history with first state
                            state.history = [{
                                prompt: structuredClone(template.structured_prompt),
                                timestamp: Date.now()
                            }];
                            state.historyIndex = 0;
                        });
                    },

                    updatePrompt: (category, attribute, value) => {
                        set((state) => {
                            if (!state.template) return;

                            // Immer handles immutability automatically
                            const categoryObj = state.template.structured_prompt[category] as any;
                            categoryObj[attribute] = value;
                            state.template.updated_at = new Date();

                            // Add to history
                            const newHistory = state.history.slice(0, state.historyIndex + 1);
                            newHistory.push({
                                prompt: structuredClone(state.template.structured_prompt),
                                timestamp: Date.now()
                            });

                            // Circular buffer: keep only last 50 states
                            if (newHistory.length > state.maxHistoryLength) {
                                newHistory.shift(); // Remove oldest
                            } else {
                                state.historyIndex++;
                            }

                            state.history = newHistory;
                        });
                    },

                    batchUpdatePrompt: (updates) => {
                        set((state) => {
                            if (!state.template) return;

                            // Apply all updates in single transaction
                            updates.forEach(({ category, attribute, value }) => {
                                const categoryObj = state.template!.structured_prompt[category] as any;
                                categoryObj[attribute] = value;
                            });
                            state.template.updated_at = new Date();

                            // Single history entry for batch
                            const newHistory = state.history.slice(0, state.historyIndex + 1);
                            newHistory.push({
                                prompt: structuredClone(state.template.structured_prompt),
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
                            const response = await fetch('/api/variations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    template_id: template.id,
                                    structured_prompt: template.structured_prompt,
                                    seed: seed ?? Math.floor(Math.random() * 1000000),
                                }),
                            });

                            if (!response.ok) {
                                const error = await response.json();
                                throw new Error(error.message || 'Generation failed');
                            }

                            const variation: Variation = await response.json();

                            set((state) => {
                                if (state.template) {
                                    state.template.variations.push(variation);
                                }
                            });

                            return variation;

                        } catch (error) {
                            console.error('Generation failed:', error);
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

                    // ==================================================================
                    // HISTORY MANAGEMENT
                    // ==================================================================

                    undo: () => {
                        const { history, historyIndex } = get();

                        if (historyIndex > 0) {
                            const newIndex = historyIndex - 1;
                            set((state) => {
                                if (state.template) {
                                    state.template.structured_prompt = structuredClone(
                                        history[newIndex].prompt
                                    );
                                    state.template.updated_at = new Date();
                                }
                                state.historyIndex = newIndex;
                            });
                        }
                    },

                    redo: () => {
                        const { history, historyIndex } = get();

                        if (historyIndex < history.length - 1) {
                            const newIndex = historyIndex + 1;
                            set((state) => {
                                if (state.template) {
                                    state.template.structured_prompt = structuredClone(
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
                                    prompt: structuredClone(state.template.structured_prompt),
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
