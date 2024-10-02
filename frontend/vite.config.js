import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'; // Needed to resolve file paths

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),  // React app entry
        background: resolve(__dirname, 'src/background.js'),  // Background script
      },
      output: {
        entryFileNames: '[name].js', // Ensure background.js and others are named appropriately
      }
    }
  },
  publicDir: 'public', // Ensure manifest.json is picked up from here
});
