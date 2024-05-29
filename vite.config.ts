import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

if (!process.env.VITE_API_URL) {
  process.env.VITE_API_URL = 'https://inverted-ca-artifact-13.deno.dev'
  // process.env.VITE_API_URL = 'https://localhost:8002'
  // process.env.VITE_API_URL = 'https://192.168.1.49:8000'
}

console.log('VITE_API_URL', process.env.VITE_API_URL)

// https://vitejs.dev/config/
export default defineConfig({ plugins: [react()], build: { sourcemap: true } })
