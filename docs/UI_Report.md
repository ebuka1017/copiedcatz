# CopiedCatz UI Design Report

## Visual Identity System

### 1. Color Palette
We moved away from generic "SaaS Blue" to a more vibrant, creative palette.
-   **Primary Gradient**: `from-blue-400 to-pink-400`.
    -   *Why*: Represents the "magic" of AI and creativity. It feels dynamic and alive, avoiding generic purple tones.
-   **Background**: Deep Slate (`slate-900` to `indigo-950`).
    -   *Why*: Reduces eye strain and makes colorful images stand out. Dark mode is the default for creative tools.
-   **Glass**: White with low opacity (`bg-white/10`) and blur (`backdrop-blur-md`).
    -   *Why*: Creates depth and hierarchy without solid borders. It feels modern and "light".

### 2. Typography
**Font**: `Poppins` (Google Fonts).
-   *Why*: It’s a geometric sans-serif that feels friendly yet technical. It has excellent readability at small sizes (UI labels) and character at large sizes (Headings).
-   *Weights*: We use `Light (300)` for elegance and `Bold (700)` for impact.

### 3. Iconography
**Library**: `Hugeicons` (Stroke Rounded).
-   *Why*: They are softer and more friendly than standard sharp icons (like Lucide default). The rounded corners match our `rounded-2xl` card border radius.
-   *Usage*: We use icons heavily to reduce text density and guide the eye.

## Component Design

### The `GlassCard`
Our core container.
-   **Implementation**: CSS Modules (`glass-card.module.css`).
-   **Features**:
    -   Subtle white border (`border-white/10`).
    -   Hover glow effects to indicate interactivity.
    -   Noise texture (optional) for tactile feel.

### The `PromptControls`
The most complex component.
-   **Challenge**: Displaying a complex JSON object without overwhelming the user.
-   **Solution**:
    -   **Simple Mode**: Friendly inputs for "Description", "Style", "Mood".
    -   **Advanced Mode**: Full JSON editor for power users.
    -   **Toggle**: Clear switch between modes using icons (`TextFont` vs `Code`).

### Empty States & Errors
-   **Philosophy**: Never leave the user staring at a blank screen.
-   **Implementation**:
    -   **Empty**: "No templates yet" + Big CTA button.
    -   **Error**: Red-tinted glass card with a "Try Again" button.
    -   *Why*: Turns a negative moment (no data/error) into a clear path forward.

## Responsiveness Strategy
-   **Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`.
    -   *Why*: Scales naturally from mobile (stacked) to desktop (side-by-side).
-   **Navbar**: Collapses links on mobile (pending implementation in Phase 3).
-   **Touch Targets**: All buttons are at least 44px height for easy tapping.
