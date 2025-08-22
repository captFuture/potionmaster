// Vite config that completely bypasses TypeScript for Raspberry Pi webpack compatibility
import { defineConfig } from 'vite';

export default defineConfig({
  // Completely disable TypeScript processing in Vite
  esbuild: false, // Disable esbuild entirely
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.ts': 'js',
        '.tsx': 'jsx'
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './src/main.tsx',
      external: [],
    }
  },
  server: {
    port: 8080,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Define empty process.env to avoid errors
  define: {
    'process.env': '({})'
  }
});