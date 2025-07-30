import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  preview: {
    allowedHosts: ['tv-ip-12025.onrender.com']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          hls: ['hls.js']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
