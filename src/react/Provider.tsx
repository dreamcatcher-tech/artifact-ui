import { useMemo, createContext, FC } from 'react'
import WebClient from '../api/web-client.ts'
import { Artifact } from '../api/web-client.types.ts'
import { deserializeError as toError } from 'serialize-error'
import { toEvents } from './utils.ts'

interface ContextType {
  artifact: Artifact
}
export const ArtifactContext = createContext<ContextType>({
  artifact: {} as WebClient,
})
interface Props {
  children: React.ReactNode
  url?: string
}

const Provider: FC<Props> = ({ children, url }) => {
  url = url || import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error('API URL not set')
  }
  const artifact = useMemo(() => new WebClient(url!, toError, toEvents), [url])
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
