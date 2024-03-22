import { SessionContext } from '../stories/Session.tsx'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import {
  Splice,
  Cradle,
  DispatchFunctions,
  PID,
} from '../api/web-client.types.ts'
import posix from 'path-browserify'
import { assertArray } from '@sindresorhus/is'
const log = Debug('AI:hooks')

const useAPI = (): Cradle => {
  const { artifact } = useContext(ArtifactContext)
  return artifact
}
export const useArtifactSplices = (pid?: PID, path?: string) => {
  log('useArtifactPatches', pid, path)
}
export const useArtifact = <T>(path: string, pid?: PID): T | undefined => {
  if (posix.isAbsolute(path)) {
    throw new Error(`path must be relative: ${path}`)
  }
  log('useArtifact', pid, path)
  const api = useAPI()
  const [artifact, setArtifact] = useState<T>()
  useEffect(() => {
    if (!pid) {
      return
    }
    let active = true
    const stream = api.read({ pid, path })
    const reader = stream.getReader()
    let latest: string
    const consume = async () => {
      while (stream.locked) {
        const { done, value } = await reader.read()
        // TODO retry on disconnection
        if (done || !active) {
          return
        }
        log('consume', value)
        assertArray(value.changes)
        let patched = ''
        for (const diff of value.changes) {
          if (diff.added) {
            patched += diff.value
          } else if (diff.removed) {
            const count = diff.count ?? 0
            patched = patched.substring(0, -count)
          } else {
            patched += diff.value
          }
        }
        log('patched', patched)
        if (latest !== patched) {
          latest = patched
          setArtifact(JSON.parse(patched))
        }
      }
    }
    consume()
    return () => {
      active = false
      reader.cancel()
    }
  }, [api, pid, path])
  if (!pid) {
    return
  }
  log('artifact', artifact)
  return artifact
}

export const useRawArtifact = (pid: PID, path: string) => {
  // used to access raw Uint8Array data
  log('useRawArtifact', pid, path)
}

export const usePing = () => {
  const artifact = useAPI()
  return (...args: Parameters<typeof artifact.ping>) => artifact.ping(...args)
}

export const useActions = (isolate: string, pid?: PID) => {
  const artifact = useAPI()
  const [actions, setActions] = useState<DispatchFunctions>()
  const [error, setError] = useState()
  useEffect(() => {
    log('useActions', isolate, artifact)
    let active = true
    if (!pid) {
      return
    }
    artifact
      .pierces(isolate, pid)
      .then((actions) => {
        if (active) {
          setActions(actions)
        }
      })
      .catch(setError)

    return () => {
      active = false
    }
  }, [pid, artifact, isolate])
  if (error) {
    throw error
  }
  return actions
}

enum RepoStatus {
  probing = 'probing',
  cloning = 'cloning',
  initializing = 'initializing',
  ready = 'ready',
  error = 'error',
}
export const useRepo = (repo: string, init = false) => {
  const artifact = useAPI()
  const [status, setStatus] = useState<RepoStatus>(RepoStatus.probing)
  const [pid, setPID] = useState<PID>()
  const [error, setErrorObj] = useState<Error>()
  const setError = (error: Error) => {
    setErrorObj(error)
    setStatus(RepoStatus.error)
  }
  useEffect(() => {
    let active = true
    const load = async () => {
      let probe = await artifact.probe({ repo })
      if (!probe && active) {
        if (init) {
          setStatus(RepoStatus.initializing)
          probe = await artifact.init({ repo })
        } else {
          setStatus(RepoStatus.cloning)
          probe = await artifact.clone({ repo })
        }
      }
      if (!active) {
        return
      }
      if (!probe) {
        setError(new Error('probe is not defined: ' + repo))
      } else {
        setStatus(RepoStatus.ready)
        setPID(probe.pid)
      }
    }
    load().catch(setError)
    return () => {
      active = false
    }
  }, [artifact, init, repo])
  return { status, pid, error }
}

enum SessionStatus {
  probing = 'probing',
  creating = 'creating',
  ready = 'ready',
  error = 'error',
}
export type Session = {
  status?: SessionStatus
  pid?: PID
  error?: Error
}
export const useNewSession = (basePID?: PID) => {
  // start a new session if we don't have one, or use current session
  // returns undefined until the new session has been acquired
  // Ensures on page reload the session stays the same
  // sets the session url params

  const artifact = useAPI()
  const [pid, setPID] = useState<PID>()
  const [error, setError] = useState<Error>()
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.probing)
  useEffect(() => {
    if (!basePID) {
      return
    }
    let active = true
    const load = async () => {
      // TODO if we might be resuming a session, try find it in the children

      const { create } = await artifact.pierces('session', basePID)
      if (!active) {
        return
      }
      setStatus(SessionStatus.creating)
      // TODO add prefix to the session
      // TODO do not require any process options
      const session = (await create()) as PID
      if (!active) {
        return
      }
      setPID(session)
      setStatus(SessionStatus.ready)
    }
    load().catch((error: Error) => {
      setError(error)
      setStatus(SessionStatus.error)
    })
    return () => {
      active = false
    }
  }, [artifact, basePID])
  return { status, pid, error }
}
export const useSession = () => {
  // should look higher and get the session somehow ?
  return useContext(SessionContext).session
}
export const useGoalie = (pid?: PID) => {
  return useHelp('goalie', pid)
}
export const useHelp = (help: string, pid?: PID) => {
  const actions = useActions('engage-help', pid)
  const prompt = useCallback(
    async (text: string) => {
      log('prompt', text)
      if (!actions || !actions.engage) {
        throw new Error('actions.engage is not defined')
      }
      const result = await actions.engage({ help, text })
      log('result', result)
      return result
    },
    [actions, help]
  )
  if (!actions || !actions.engage) {
    return
  }
  return prompt
}

export const useLatestCommit = (pid: PID): Splice | undefined => {
  log('useLatestCommit', pid)
  // get a splice, and then return the latest thing

  const api = useAPI()
  const [splice, setSplice] = useState<Splice>()
  const [error, setError] = useState()
  useEffect(() => {
    if (!pid) {
      return
    }
    let active = true
    const stream = api.read({ pid })
    const reader = stream.getReader()
    const read = async () => {
      while (stream.locked) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }
        if (active) {
          setSplice(value)
        }
      }
    }
    read().catch(setError)
    return () => {
      active = false
      reader.cancel()
    }
  }, [api, pid])
  if (error) {
    throw error
  }
  return splice
}
export const useError = () => {
  const [error, setError] = useState()
  if (error) {
    throw error
  }
  return setError
}
