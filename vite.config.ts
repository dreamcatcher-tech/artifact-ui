import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

if (!process.env.VITE_API_URL) {
  process.env.VITE_API_URL = 'https://longthreat.deno.dev'
  // process.env.VITE_API_URL = 'https://localhost:8002'
  // process.env.VITE_API_URL = 'https://192.168.1.49:8000'
}

function excludeStories(): Plugin {
  return {
    name: 'exclude-stories',
    resolveId(source) {
      if (
        process.env.STORYBOOK_CHROMATIC === 'true' &&
        source.includes('API.stories.tsx')
      ) {
        console.log('exclude-stories')
        return this.resolve(source, undefined, { skipSelf: true }).then(() => {
          return null
        })
      }
      return null
    },
  }
}

console.log('VITE_API_URL', process.env.VITE_API_URL)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), excludeStories()],
  build: { sourcemap: true },
})
