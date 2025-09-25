import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'   // ✅ ESM-safe import

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // base: '/public/hyper-tracker/', // ← if you deploy there
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
