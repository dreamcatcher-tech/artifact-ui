import { useMemo, createContext, FC } from 'react'
import { Shell } from '../api/web-client.ts'
import { WebClientEngine } from '../api/web-client-engine.ts'
import { Artifact } from '../api/web-client.types.ts'

interface ContextType {
  artifact: Artifact
}
export const ArtifactContext = createContext<ContextType>({
  artifact: {} as Artifact,
})
interface Props {
  children: React.ReactNode
  url?: string
}

const Provider: FC<Props> = ({ children, url }) => {
  url = url || import.meta.env.VITE_API_URL
  const artifact = useMemo(() => {
    if (!url) {
      throw new Error('API URL not set')
    }
    const engine = WebClientEngine.create(url)
    const superuser = {
      id: '__system',
      account: 'system',
      repository: 'system',
      branches: ['main'],
    }
    return Shell.create(engine, superuser)
  }, [url])
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
