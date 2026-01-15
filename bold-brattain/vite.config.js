import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/Eit-carbon-capture-game/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'game.html'),
      },
    },
  },
})
