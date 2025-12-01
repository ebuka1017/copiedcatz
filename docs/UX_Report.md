# CopiedCatz UX Research & Design Report

## Executive Summary
CopiedCatz is designed to solve a specific problem in the creative workflow: **the gap between inspiration and creation**. Creatives often see an image with a specific "vibe" (lighting, composition, mood) but struggle to reverse-engineer the prompt or settings to recreate it. CopiedCatz acts as a "Visual DNA Sequencer," extracting these hidden attributes and making them reusable.

## Core Philosophy: "Visual DNA"
We chose the metaphor of "Visual DNA" to explain the complex technical process of computer vision and prompt engineering.
-   **Extraction**: "Sequencing" the DNA of an image.
-   **Templates**: Storing this DNA for future use.
-   **Generation**: "Cloning" the style with new subjects.

## User Personas
1.  **The Style Hunter**: A designer or content creator who collects mood boards. They want to *capture* a style instantly without guessing keywords.
    -   *Pain Point*: "I like this lighting, but I don't know the photography terms for it."
    -   *Solution*: One-click extraction via Chrome Extension.
2.  **The Power Remixer**: An AI artist who wants to fine-tune generations. They need control over the specific parameters.
    -   *Pain Point*: "The AI gets the style right but the wrong camera angle."
    -   *Solution*: "Structured Prompt" editor with granular controls (Lighting, Camera, Medium).

## Key UX Decisions

### 1. The "Glass" Aesthetic
**Why**: We chose a dark, glassmorphism-heavy UI to mimic professional creative tools (like Linear, Raycast, or high-end video editors) while feeling futuristic.
**Effect**: It creates a sense of "premium" utility. The content (images) should pop, while the UI recedes into a sleek frame.

### 2. Chrome Extension as the Entry Point
**Why**: Inspiration happens *anywhere* on the web, not just inside our app.
**Decision**: Instead of asking users to download images and upload them (friction), we meet them where they are.
**Flow**: Right-click -> "Extract Visual DNA" -> Instant analysis.

### 3. Structured Prompting vs. Raw Text
**Why**: Raw text prompts are messy and hard to edit.
**Decision**: We break prompts into JSON-like structures (`lighting`, `camera`, `composition`).
**Benefit**: Users can swap "Golden Hour" for "Studio Lighting" without breaking the rest of the prompt logic.

### 4. "Make It Work" -> "Make It Good" -> "Make It Scale"
**Why**: We adopted this iterative approach to ensure we solved the core utility (extraction) before adding complexity (marketplace).
**Result**: A stable core product that is now ready for social features.

## Future UX Considerations (Phase 3)
-   **Marketplace**: Needs to balance "discovery" with "curation". We will prioritize "Most Used" metrics to surface high-quality DNA.
-   **Batch Processing**: Needs clear progress indicators and error handling, as AI jobs can be slow/flaky.
