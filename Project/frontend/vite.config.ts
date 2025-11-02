import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
    })
  ],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    // Enable tree-shaking
    cssCodeSplit: true,
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        },
        // Optimize chunk names for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
      // Tree-shake unused code
      treeshake: {
        moduleSideEffects: false,
        preset: 'smallest',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false
      }
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 500
  },
  // Enable tree-shaking for dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
