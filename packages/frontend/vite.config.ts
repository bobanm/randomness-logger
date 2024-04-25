import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    clearScreen: false,
    base: '/randomness/', // used when deploying to my nested public path on boban.ninja/randomness
})
