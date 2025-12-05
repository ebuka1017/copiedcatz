import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                background: resolve(process.cwd(), 'extension/background.ts'),
                content: resolve(process.cwd(), 'extension/content-script.ts'),
                popup: resolve(process.cwd(), 'extension/popup.html'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
    },
});
