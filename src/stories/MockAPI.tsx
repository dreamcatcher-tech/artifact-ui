// import the context from the real provider
// provide a top level component to wrap any other components so they will
// receive the mock api
// BUT pass thru to the real one if it is set in the env

import { useMemo, FC } from 'react'
import Real from '../api.ts'
import Debug from 'debug'
import { ArtifactContext } from '../react/Provider.tsx'
import {
  AudioPierceRequest,
  Cradle,
  DispatchFunctions,
  PID,
  Params,
  PierceRequest,
} from '../../constants.ts'

const log = Debug('AI:MockAPI')

interface Props {
  children: React.ReactNode
  /**
   * When provided, the mock will be bypassed and the real API will be used
   */
  url?: string
}
class Mock implements Cradle {
  // TODO have controls for delays
  // TODO select different mock responses for different tests
  constructor() {
    log('MockAPI loaded')
  }
  async ping(params = {}) {
    await Promise.resolve()
    return params
  }
  async apiSchema(params: { isolate: string }) {
    log('params', params)
    await Promise.resolve()
    return { isolate: {} }
  }
  async pierce(params: PierceRequest) {
    log('params', params)
    await Promise.resolve()
    return 'TODO'
  }
  audioPierce(params: AudioPierceRequest) {
    log('params', params)
    return Promise.resolve('TODO')
  }
  logs(params: { repo: string }): Promise<object[]> {
    log('params', params)
    return Promise.resolve([])
  }
  async pierces(isolate: string, target: PID) {
    log('isolate', isolate, 'target', target)
    await Promise.resolve()
    const pierces: DispatchFunctions = {}
    if (isolate === 'engage-help') {
      pierces.engageInBand = async (params?: Params) => {
        // Update the type of 'params' parameter
        const { help, text } = params || { help: '', text: '' }
        log('engageInBand', help, text)
        return 'TODO'
      }
    }
    return pierces
  }
}

const Provider: FC<Props> = ({ children, url }) => {
  const artifact = useMemo(() => (url ? new Real(url) : new Mock()), [url])

  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
