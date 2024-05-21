import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

if (!process.env.VITE_API_URL) {
  process.env.VITE_API_URL = 'https://healthy-seal-74.deno.dev'
  // process.env.VITE_API_URL = 'https://localhost:8001'
  process.env.VITE_API_URL = 'https://192.168.1.49:8000'
}

console.log('VITE_API_URL', process.env.VITE_API_URL)

// https://vitejs.dev/config/
export default defineConfig({ plugins: [react()], build: { sourcemap: true } })
