import { useMemo, FC, useEffect } from 'react'
import { Shell } from '../api/web-client.ts'
import { WebClientEngine } from '../api/web-client-engine.ts'
import Debug from 'debug'
import { ArtifactContext } from '../react/Provider.tsx'
import {
  Artifact,
  DispatchFunctions,
  IsolateApiSchema,
  PID,
  Params,
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
class Mock implements Artifact {
  // TODO have controls for delays
  // TODO select different mock responses for different tests
  constructor() {
    log('MockAPI loaded')
  }
  get pid() {
    return {
      id: 'mock',
      account: 'dreamcatcher',
      repository: 'gpt',
      branches: ['main'],
    }
  }
  async ping(params = {}) {
    await Promise.resolve()
    return params
  }
  async apiSchema(isolate: string): Promise<IsolateApiSchema> {
    await Promise.resolve()
    return { isolate: { type: 'object', description: isolate } }
  }
  transcribe(params: { audio: File }) {
    log('params', params)
    return Promise.resolve({ text: 'TODO' })
  }
  logs(params: { repo: string }): Promise<object[]> {
    log('params', params)
    return Promise.resolve([])
  }
  async actions(isolate: string, target: PID) {
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
  probe(params: { pid: PID }) {
    log('params', params)
    return Promise.resolve({
      pid: {
        id: 'mock',
        account: 'dreamcatcher',
        repository: 'gpt',
        branches: ['main'],
      },
      head: 'testCommitHash',
    })
  }
  init(params: { repo: string }) {
    log('params', params)
    return Promise.resolve({
      pid: {
        id: 'mock',
        account: 'dreamcatcher',
        repository: 'gpt',
        branches: ['main'],
      },
      head: 'testCommitHash',
    })
  }
  clone(params: { repo: string }) {
    log('params', params)
    return Promise.resolve({
      pid: {
        id: 'mock',
        account: 'dreamcatcher',
        repository: 'gpt',
        branches: ['main'],
      },
      head: 'testCommitHash',
    })
  }
  pull(): Promise<{ pid: PID; head: string }> {
    throw new Error('not implemented')
  }
  push() {
    return Promise.reject(new Error('not implemented'))
  }
  rm(params: { repo: string }) {
    log('params', params)
    return Promise.resolve(true)
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
    const engine = WebClientEngine.create(usable)
    const superuser = {
      id: '__system',
      account: 'system',
      repository: 'system',
      branches: ['main'],
    }
    return Shell.create(engine, superuser)
  }, [mock, url])
  useEffect(() => {
    return () => {
      artifact.stop()
    }
  }, [artifact])
  return (
    <ArtifactContext.Provider value={{ artifact }}>
      {children}
    </ArtifactContext.Provider>
  )
}

export default Provider
