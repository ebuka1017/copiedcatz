export interface ObjectDescription {
    description: string;
    location: string;
    relationship: string;
    relative_size: string;
    shape_and_color: string;
    texture?: string;
    appearance_details?: string;
    number_of_objects?: number;
    pose?: string;
    expression?: string;
    clothing?: string;
    action?: string;
    gender?: string;
    skintone_and_texture?: string;
    orientation?: string;
}

export interface Lighting {
    conditions: string;
    direction: string;
    shadows?: string;
}

export interface Aesthetics {
    composition: string;
    color_scheme: string;
    mood_atmosphere: string;
    preference_score?: string;
    aesthetic_score?: string;
}

export interface PhotographicCharacteristics {
    depth_of_field: string;
    focus: string;
    camera_angle: string;
    lens_focal_length: string;
}

export interface TextRender {
    text: string;
    location: string;
    size: string;
    color: string;
    font: string;
    appearance_details?: string;
}

export interface StructuredPrompt {
    short_description: string;
    objects: ObjectDescription[];
    background_setting: string;
    lighting: Lighting;
    aesthetics: Aesthetics;
    photographic_characteristics?: PhotographicCharacteristics;
    style_medium: string;
    text_render?: TextRender[];
    context: string;
    artistic_style: string;
}

export interface GenerateImageRequest {
    prompt?: string;
    images?: string[];
    structured_prompt?: StructuredPrompt;
    seed?: number;
    num_results?: number;
    sync?: boolean; // If true, wait for result (not standard Bria V2 but useful for our wrapper)
}

export interface GenerateImageResponse {
    // Direct response from edge function
    image_url?: string;
    seed?: number;
    // Standard Bria API response format
    result?: {
        id: string;
        url: string;
        resolution: { width: number; height: number };
    }[];
    structured_prompt?: StructuredPrompt;
    request_id?: string;
    status_url?: string;
}

export interface GenerateStructuredPromptRequest {
    prompt?: string;
    images?: string[];
    structured_prompt?: StructuredPrompt;
}

export interface GenerateStructuredPromptResponse {
    structured_prompt: StructuredPrompt;
}

export interface RemoveBackgroundRequest {
    image_url?: string; // URL or Base64
    image_file?: string; // Base64
}

export interface RemoveBackgroundResponse {
    result_url: string;
}

export interface UpscaleRequest {
    image_url?: string;
    scale_factor: 2 | 4;
}

export interface UpscaleResponse {
    result_url: string;
}
