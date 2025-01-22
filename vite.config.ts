import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/yaml_builder/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
