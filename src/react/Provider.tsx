import { useMemo, createContext, FC } from 'react'
import API from '../api.ts'
import { Cradle } from '../../constants.ts'

interface ContextType {
  artifact: Cradle
}
export const ArtifactContext = createContext<ContextType>({
  artifact: {} as API,
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
  const artifact = useMemo(() => new API(url!), [url])
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
