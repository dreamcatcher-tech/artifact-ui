// import the context from the real provider
// provide a top level component to wrap any other components so they will
// receive the mock api
// BUT pass thru to the real one if it is set in the env
import { deserializeError } from 'serialize-error'
import { useMemo, FC } from 'react'
import WebClient from '../api/web-client.ts'
import Debug from 'debug'
import { ArtifactContext } from '../react/Provider.tsx'
import {
  Cradle,
  DispatchFunctions,
  PID,
  Params,
  PierceRequest,
} from '../api/web-client.types.ts'

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
  transcribe(params: { audio: File }) {
    log('params', params)
    return Promise.resolve({ text: 'TODO' })
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
  stop() {
    throw new Error('Not implemented')
  }
  init(params: { repo: string }) {
    log('params', params)
    return Promise.resolve({
      pid: { account: 'dreamcatcher', repository: 'gpt', branches: ['main'] },
    })
  }
  clone(params: { repo: string }) {
    log('params', params)
    return Promise.resolve({
      pid: { account: 'dreamcatcher', repository: 'gpt', branches: ['main'] },
    })
  }
}

const Provider: FC<Props> = ({ children, url }) => {
  const artifact = useMemo(() => {
    if (url) {
      return new WebClient(url, deserializeError)
    }
    return new Mock()
  }, [url])

  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
