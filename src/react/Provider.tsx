import { useMemo, createContext, FC } from 'react'
import WebClient from '../api/web-client.ts'
import { Cradle } from '../api/web-client.types.ts'
import { deserializeError } from 'serialize-error'

interface ContextType {
  artifact: Cradle
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
  const artifact = useMemo(() => new WebClient(url!, deserializeError), [url])
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
