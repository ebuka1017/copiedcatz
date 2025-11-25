# Copiedcatz V2

Copiedcatz is an AI-powered platform that extracts "Visual DNA" from images (lighting, composition, camera settings, etc.) and allows users to generate new variations based on that DNA.

## Features

- **Visual DNA Extraction**: Analyze images to extract structured prompts (Scene, Lighting, Camera, etc.).
- **Template Editor**: Fine-tune the extracted DNA and generate new image variations.
- **Chrome Extension**: Capture images from any website and send them directly to the editor.
- **Real-time Updates**: Watch the extraction process progress in real-time.
- **History & Undo/Redo**: robust state management for your editing session.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Prisma)
- **State Management**: Zustand + Immer
- **Real-time**: Pusher
- **Storage**: Vercel Blob
- **Styling**: Vanilla CSS Modules + Tailwind Utility Classes (mixed approach for specific needs)
- **AI**: Bria AI (Integration ready)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL Database
- Pusher Account
- Vercel Account (for Blob storage)

### Environment Variables

Create a `.env` file with the following:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Pusher
PUSHER_APP_ID="your_app_id"
PUSHER_KEY="your_key"
PUSHER_SECRET="your_secret"
PUSHER_CLUSTER="us2"
NEXT_PUBLIC_PUSHER_KEY="your_key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# Bria AI
BRIA_API_KEY="your_bria_key"
BRIA_WEBHOOK_SECRET="your_webhook_secret"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="your_blob_token"

# Auth
JWT_SECRET="your_jwt_secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation

```bash
npm install
```

### Database Setup

```bash
npx prisma generate
npx prisma migrate dev
```

### Running the App

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Chrome Extension

The Chrome Extension allows you to capture images from any webpage.

### Building the Extension

```bash
npm run build:extension
```

This will compile the TypeScript files in the `extension/` directory.

### Loading into Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable "Developer mode" in the top right.
3. Click "Load unpacked".
4. Select the `extension` folder in this project.

## Deployment

This project is configured for deployment on **Netlify**.

1. Connect your repository to Netlify.
2. Set the Environment Variables in the Netlify dashboard.
3. The `netlify.toml` file handles the build configuration (`npm run build`).

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: React components (UI, Editor, etc.).
- `src/lib`: Utilities, hooks, and stores.
- `src/lib/stores`: Zustand state management.
- `extension`: Chrome Extension source code.
- `prisma`: Database schema.
