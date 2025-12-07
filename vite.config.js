import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [preact()],
    base: './', // Important for WebXDC to load assets relatively
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    }
});
