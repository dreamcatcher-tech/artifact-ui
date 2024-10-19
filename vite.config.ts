import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import sri from '@vividlemon/vite-plugin-sri'


if (!process.env.VITE_API_URL) {
  process.env.VITE_API_URL = 'https://longthreat-next.deno.dev'
  // process.env.VITE_API_URL = 'https://localhost:8002'
  // process.env.VITE_API_URL = 'https://192.168.1.49:8000'
}

function excludeStories(): Plugin {
  return {
    name: 'exclude-stories',
    resolveId(source) {
      if (
        process.env.GITHUB_ACTIONS === 'true' &&
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
  plugins: [react(), excludeStories(), sri()],
  build: { sourcemap: true },
})
