// import the context from the real provider
// provide a top level component to wrap any other components so they will
// receive the mock api
// BUT pass thru to the real one if it is set in the env

import { useMemo, createContext, useEffect, useState, FC } from 'react'
import Real from '../api.ts'
import Debug from 'debug'
import { ArtifactContext } from '../react/Provider.tsx'

const debug = Debug('AI:MockAPI')

interface Props {
  children: React.ReactNode
}

class Mock {
  ping() {
    return { message: 'pong' }
  }
  apiSchema() {}
}

export const api = import.meta.env.VITE_API_URL
  ? new Real(import.meta.env.VITE_API_URL)
  : new Mock()

const Provider: FC<Props> = ({ children }) => {
  // start the api fetch client
  // in storybook, we should make a mock client
  // then use this to test the splice formats
  const real = useMemo(() => new Real(import.meta.env.VITE_API_URL), [])
  const mock = useMemo(() => new Mock(), [])

  const artifact = import.meta.env.VITE_API_URL ? real : mock
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
