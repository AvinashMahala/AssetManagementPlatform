/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // Allow imports using '@/...' to resolve to /src/* during tests
      { find: /^@\/(.*)/, replacement: '/src/$1' }
    ]
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    // Add Node.js globals that might be missing
    server: {
      deps: {
        inline: ['@testing-library/jest-dom'],
      },
    },
  },
})