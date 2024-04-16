import equal from 'fast-deep-equal'
import { SessionContext } from '../stories/Session.tsx'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import {
  Splice,
  Artifact,
  DispatchFunctions,
  PID,
  pidFromRepo,
} from '../api/web-client.types.ts'
import posix from 'path-browserify'
const log = Debug('AI:hooks')

const useAPI = (): Artifact => {
  const { artifact } = useContext(ArtifactContext)
  return artifact
}
export const useArtifactSplices = (pid?: PID, path?: string) => {
  log('useArtifactPatches', pid, path)
}
export const useArtifact = <T>(path: string, pid?: PID): T | undefined => {
  log('useArtifact', pid, path)
  const splice = useSplice(pid, path)
  const [lastSplice, setLastSplice] = useState<Splice>()
  const [string, setString] = useState('')
  const [artifact, setArtifact] = useState<T>()
  if (!pid) {
    return
  }
  if (splice && splice.changes && !equal(lastSplice, splice)) {
    setLastSplice(splice)
    if (splice.changes[path]) {
      const { patch } = splice.changes[path]
      if (patch && string !== patch) {
        setString(patch)
        setArtifact(JSON.parse(patch))
      }
    }
  }
  log('artifact', artifact)
  return artifact
}

export const useSplice = (pid?: PID, path?: string) => {
  if (path && posix.isAbsolute(path)) {
    throw new Error(`path must be relative: ${path}`)
  }
  const [splice, setSplice] = useState<Splice>()
  log('useSplice', pid, path, splice)
  const api = useAPI()

  useEffect(() => {
    if (!pid) {
      return
    }
    const abort = new AbortController()
    const consume = async () => {
      const after = undefined
      for await (const splice of api.read(pid, path, after, abort.signal)) {
        log('consumed', splice)
        setSplice(splice)
      }
    }
    consume()
    return () => abort.abort()
  }, [api, pid, path])
  if (!pid) {
    return
  }
  return splice
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
    // TODO listen to changes in the available actions
    artifact
      .actions(isolate, pid)
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
  if (error) {
    throw error
  }
  const setError = (error: Error) => {
    setErrorObj(error)
    setStatus(RepoStatus.error)
  }
  useEffect(() => {
    let active = true
    const load = async () => {
      const pid = pidFromRepo(artifact.pid.id, repo)
      let probe = await artifact.probe({ pid })
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
  restoring = 'restoring',
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
  const artifact = useAPI()
  const [pid, setPID] = useState<PID>()
  const [error, setError] = useState<Error>()
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.probing)

  useEffect(() => {
    if (!basePID) {
      return
    }
    if (pid) {
      return
    }
    let active = true
    const createSession = async () => {
      const existing = sessionStorage.getItem('session')
      if (existing) {
        setStatus(SessionStatus.restoring)
        const session = JSON.parse(existing) as PID
        log('existing session', session)
        // TODO assert this is a derivative of basePID
        const result = await artifact.probe({ pid: session })
        if (!active) {
          return
        }
        if (result) {
          setPID(session)
          setStatus(SessionStatus.ready)
          return
        }
      }

      log('createSession', basePID)
      setStatus(SessionStatus.creating)
      const { create } = await artifact.actions('session', basePID)
      if (!active) {
        return
      }
      // TODO add prefix to the session
      // TODO do not require any process options
      const session = (await create()) as PID
      if (!active) {
        return
      }
      setPID(session)
      setStatus(SessionStatus.ready)
      sessionStorage.setItem('session', JSON.stringify(session, null, 2))
    }
    createSession().catch((error: Error) => {
      setError(error)
      setStatus(SessionStatus.error)
    })
    return () => {
      active = false
    }
  }, [artifact, basePID, pid])
  if (error) {
    throw error
  }
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
  const splice = useSplice(pid)
  log('useLatestCommit', pid, splice)
  return splice
}
export const useError = () => {
  const [error, setError] = useState()
  if (error) {
    throw error
  }
  return setError
}
export const useTranscribe = () => {
  const api = useAPI()
  const transcribe = useCallback(
    async (audio: File) => {
      const transcription = await api.transcribe({ audio })
      return transcription.text
    },
    [api]
  )
  return transcribe
}
