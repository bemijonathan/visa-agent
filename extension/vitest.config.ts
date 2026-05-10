import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    globals: true,
    testTimeout: 30000,
  },
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify('demo-api-key'),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify('demo-visa-agent.firebaseapp.com'),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify('demo-visa-agent'),
    'import.meta.env.VITE_USE_FIREBASE_EMULATOR': JSON.stringify('true'),
  },
})
