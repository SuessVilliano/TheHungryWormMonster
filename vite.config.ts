import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Vite configuration for The Really Hungry Worm Monster.
// Uses the React plugin and an "@" alias that points at /src so imports stay tidy.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  server: {
    host: true, // expose on the local network so the game can be tested on a phone
    port: 5173,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
