import { z } from 'zod';

/**
 * Validation schemas for API endpoints and form inputs
 * Using Zod for runtime type validation and security
 */

// Template validation
export const templateSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().max(500, 'Description too long').optional(),
    prompt: z.string().min(1, 'Prompt is required').max(10000, 'Prompt too long'),
    structured_prompt: z.record(z.any()).optional(),
    reference_url: z.string().url('Invalid URL').optional().nullable(),
    is_public: z.boolean().default(false),
    tags: z.array(z.string().max(50)).max(10, 'Too many tags').optional(),
});

export type TemplateInput = z.infer<typeof templateSchema>;

// Image generation validation
export const generateImageSchema = z.object({
    prompt: z.string().min(1, 'Prompt is required').max(5000, 'Prompt too long'),
    templateId: z.string().uuid('Invalid template ID').optional(),
    width: z.number().int().min(256).max(2048).default(1024),
    height: z.number().int().min(256).max(2048).default(1024),
    num_results: z.number().int().min(1).max(4).default(1),
    sync: z.boolean().default(false),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;

// File upload validation
export const fileUploadSchema = z.object({
    filename: z.string().min(1).max(255),
    contentType: z.string().refine(
        (type) => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(type),
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'
    ),
    size: z.number().max(10 * 1024 * 1024, 'File too large. Maximum 10MB'),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;

// User profile validation
export const userProfileSchema = z.object({
    full_name: z.string().min(1).max(100).optional(),
    avatar_url: z.string().url().optional().nullable(),
    bio: z.string().max(500).optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

// Search query validation
export const searchQuerySchema = z.object({
    query: z.string().max(200, 'Search query too long').optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    sort: z.enum(['created_at', 'updated_at', 'name']).default('created_at'),
    order: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// Marketplace query validation
export const marketplaceQuerySchema = z.object({
    query: z.string().max(200).optional(),
    category: z.string().max(50).optional(),
    tags: z.array(z.string()).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(12),
});

export type MarketplaceQueryInput = z.infer<typeof marketplaceQuerySchema>;

// API key validation
export const apiKeySchema = z.object({
    name: z.string().min(1).max(100),
    scopes: z.array(z.enum(['read', 'write', 'delete'])).min(1),
    expiresAt: z.date().optional(),
});

export type ApiKeyInput = z.infer<typeof apiKeySchema>;

// Structured prompt validation (for image generation)
export const structuredPromptSchema = z.object({
    scene_description: z.string().max(1000).optional(),
    visual_style: z.string().max(500).optional(),
    placement: z.object({
        position: z.enum(['center', 'left', 'right', 'top', 'bottom']).optional(),
        scale: z.number().min(0.1).max(2).optional(),
    }).optional(),
    background: z.object({
        type: z.enum(['solid', 'gradient', 'image', 'transparent']).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }).optional(),
    lighting: z.object({
        type: z.enum(['natural', 'studio', 'dramatic', 'soft']).optional(),
        direction: z.string().optional(),
    }).optional(),
    negative_prompt: z.string().max(1000).optional(),
});

export type StructuredPromptInput = z.infer<typeof structuredPromptSchema>;

/**
 * Validate input and return parsed data or throw error
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${errors}`);
    }
    return result.data;
}

/**
 * Validate input and return result object (doesn't throw)
 */
export function safeValidateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: string[];
} {
    const result = schema.safeParse(data);
    if (!result.success) {
        return {
            success: false,
            errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        };
    }
    return { success: true, data: result.data };
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Validate URL to prevent SSRF
 */
export function isAllowedUrl(url: string, allowedHosts: string[]): boolean {
    try {
        const parsed = new URL(url);
        return allowedHosts.some(host =>
            parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
        );
    } catch {
        return false;
    }
}
