/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 展示站端口固定 5176：web（chenxing-auth）占 5175，避免撞车也不允许漂移
  server: {
    port: 5176,
    strictPort: true,
  },
  preview: {
    port: 5176,
    strictPort: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
  },
})
