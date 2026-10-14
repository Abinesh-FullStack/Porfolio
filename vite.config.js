import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves this site from https://<user>.github.io/Abinesh-profolio-website/
// so every asset URL must be prefixed with the repository name.
// If you ever move to a custom domain or a <user>.github.io repo, change this to '/'.
export default defineConfig({
  base: '/Abinesh-profolio-website/',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
  },
})
