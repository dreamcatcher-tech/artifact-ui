import { useMemo, createContext, useEffect, useState, FC } from 'react'
import API from '../api.ts'
import Debug from 'debug'
const debug = Debug('AI:Provider')

export const ArtifactContext = createContext({})
interface Props {
  children: React.ReactNode
}

const Provider: FC<Props> = ({ children }) => {
  const artifact = useMemo(() => new API(import.meta.env.VITE_API_URL), [])
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
