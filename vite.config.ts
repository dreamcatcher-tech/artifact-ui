import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'

if (!process.env.VITE_API_URL) {
  process.env.VITE_API_URL = 'https://longthreat.deno.dev'
  // process.env.VITE_API_URL = 'https://localhost:8002'
  // process.env.VITE_API_URL = 'https://192.168.1.49:8000'
}

// Custom plugin to exclude api.stories.tsx conditionally
function excludeStories(): Plugin {
  return {
    name: 'exclude-stories',
    resolveId(source) {
      if (
        process.env.STORYBOOK_CHROMATIC === 'true' &&
        source.includes('API.stories.tsx')
      ) {
        console.log('exclude-stories')
        return this.resolve(source, undefined, { skipSelf: true }).then(
          (resolved) => {
            // Returning null tells Rollup to ignore this import
            return null
          }
        )
      }
      return null // Returning null for other files means "proceed with the default behavior"
    },
  }
}

console.log('VITE_API_URL', process.env.VITE_API_URL)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), excludeStories()],
  build: { sourcemap: true },
})
