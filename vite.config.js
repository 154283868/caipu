import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5174,
    host: true,
    open: true,
    proxy: {
      '/caipu': {
        target: 'https://154283868.github.io/caipu/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/caipu/, '')
      }
    }
  },
  build: {
    outDir: 'docs',
    assetsDir: 'assets',
    sourcemap: false
  }
})
