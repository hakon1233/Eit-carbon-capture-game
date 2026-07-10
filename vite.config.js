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
        game_mechanics: resolve(__dirname, 'game_mechanics.html'),
        game_rules: resolve(__dirname, 'game_rules.html'),
        game_data_reference: resolve(__dirname, 'Game_Data_Reference.html'),
        emissions_data_reference: resolve(__dirname, 'Emissions_Data_Reference.html'),
      },
    },
  },
})
