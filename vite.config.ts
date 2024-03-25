import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

if (!process.env.VITE_API_URL) {
  // process.env.VITE_API_URL = 'http://localhost:8000'
  process.env.VITE_API_URL = 'https://healthy-seal-74.deno.dev'
}

console.log('VITE_API_URL', process.env.VITE_API_URL)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
  },
})
