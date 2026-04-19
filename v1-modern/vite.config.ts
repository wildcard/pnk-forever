import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import narrat from 'vite-plugin-narrat'

export default defineConfig({
  plugins: [vue(), narrat()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
