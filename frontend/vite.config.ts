import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Increase the warning limit (in KB)
    chunkSizeWarningLimit: 1000, // now warnings appear only for chunks > 1MB
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Change this to your backend server port
        changeOrigin: true,
      },
    },
  },
})