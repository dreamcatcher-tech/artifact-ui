import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

if (!process.env.VITE_API_URL) {
  process.env.VITE_API_URL = 'https://healthy-seal-74.deno.dev'
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
