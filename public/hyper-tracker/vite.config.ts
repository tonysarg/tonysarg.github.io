import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'   // ✅ ESM-safe import

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/hyper-tracker/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
