// import the context from the real provider
// provide a top level component to wrap any other components so they will
// receive the mock api
// BUT pass thru to the real one if it is set in the env
import { toEvents } from '../react/utils.ts'
import { deserializeError as toError } from 'serialize-error'
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
  Splice,
} from '../api/web-client.types.ts'

const log = Debug('AI:MockAPI')

interface Props {
  children: React.ReactNode
  /**
   * Provide an alternate url for the api
   */
  url?: string
  /**
   * Should a mock api be used instead of a real url ?
   */
  mock?: boolean
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
  probe(params: { repo: string }) {
    log('params', params)
    return Promise.resolve({
      pid: { account: 'dreamcatcher', repository: 'gpt', branches: ['main'] },
      head: 'testCommitHash',
    })
  }
  init(params: { repo: string }) {
    log('params', params)
    return Promise.resolve({
      pid: { account: 'dreamcatcher', repository: 'gpt', branches: ['main'] },
      head: 'testCommitHash',
    })
  }
  clone(params: { repo: string }) {
    log('params', params)
    return Promise.resolve({
      pid: { account: 'dreamcatcher', repository: 'gpt', branches: ['main'] },
      head: 'testCommitHash',
    })
  }
  rm(params: { repo: string }) {
    log('params', params)
    return Promise.resolve()
  }
  read(pid: PID, path?: string, signal?: AbortSignal): ReadableStream<Splice> {
    log('read', pid, path, signal)
    return new ReadableStream<Splice>({
      start: async (controller) => {
        const mockSplice: Splice = {
          pid,
          oid: 'mockOid',
          commit: {
            message: 'test commit message',
            tree: 'mockTreeHash',
            parent: ['mockParentHash'],
            author: {
              name: 'mockAuthorName',
              email: '',
              timestamp: 0,
              timezoneOffset: 0,
            },
            committer: {
              name: 'mockCommitterName',
              email: '',
              timestamp: 0,
              timezoneOffset: 0,
            },
          },
          timestamp: Date.now(),
          path,
          changes: [],
        }
        controller.enqueue(mockSplice)
      },
    })
  }
}

export const Provider: FC<Props> = ({ children, mock, url }) => {
  const artifact = useMemo(() => {
    const usable = url || import.meta.env.VITE_API_URL
    if (mock || !usable) {
      return new Mock()
    }
    return new WebClient(usable, toError, toEvents)
  }, [mock, url])
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
