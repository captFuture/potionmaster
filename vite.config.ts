import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Disable TypeScript processing entirely to avoid project reference issues
      include: "**/*.(jsx|tsx)",
      babel: {
        plugins: [
          ["@babel/plugin-transform-typescript", { allowDeclareFields: true }]
        ]
      }
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Force esbuild to treat TypeScript as JavaScript
  esbuild: {
    loader: "tsx",
    include: /\.(ts|tsx|js|jsx)$/,
    exclude: [],
    target: "es2020"
  },
  // Disable TypeScript checking entirely
  define: {
    __DEV__: mode === 'development'
  }
}))