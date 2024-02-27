// import the context from the real provider
// provide a top level component to wrap any other components so they will
// receive the mock api
// BUT pass thru to the real one if it is set in the env

import { useMemo, createContext, useEffect, useState, FC } from 'react'
import Real from '../api.ts'
import Debug from 'debug'
import { ArtifactContext } from '../react/Provider.tsx'
import { AudioPierceRequest, Cradle, PierceRequest } from '../../constants.ts'

const debug = Debug('AI:MockAPI')

interface Props {
  children: React.ReactNode
  /**
   * When provided, the mock will be bypassed and the real API will be used
   */
  url?: string
}
class Mock implements Cradle {
  // TODO have controls for delays
  async ping(params = {}) {
    await Promise.resolve()
    return params
  }
  async apiSchema(params: { isolate: string }) {
    await Promise.resolve()
    return { isolate: {} }
  }
  async pierce(params: PierceRequest) {
    await Promise.resolve()
    return 'TODO'
  }
  audioPierce(params: AudioPierceRequest) {
    return Promise.resolve('TODO')
  }
  logs(params: { repo: string }): Promise<object[]> {
    return Promise.resolve([])
  }
}

const Provider: FC<Props> = ({ children, url }) => {
  url = url || import.meta.env.VITE_API_URL
  const artifact = useMemo(() => (url ? new Real(url) : new Mock()), [url])

  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
