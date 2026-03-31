import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'ChatPanel',
      fileName: () => 'chat-panel.js',
      formats: ['iife'],
    },
    cssCodeSplit: false,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
  },
});
