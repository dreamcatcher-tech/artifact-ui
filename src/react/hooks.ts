import equal from 'fast-deep-equal'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import {
  Splice,
  ArtifactSession,
  DispatchFunctions,
  PID,
  print,
  getActorId,
  freezePid,
} from '../api/web-client.types.ts'
import posix from 'path-browserify'
import { ulid } from 'ulid'
const log = Debug('AI:hooks')

export const useTerminal = (): ArtifactSession => {
  const { session } = useContext(ArtifactContext)
  return session
}

export const useArtifactSplices = (pid?: PID, path?: string) => {
  log('useArtifactSplices', pid, path)
  throw new Error('not implemented')
}
export const useArtifact = <T>(path: string, pid?: PID): T | undefined => {
  const splice = useSplice(pid, path)
  const [lastSplice, setLastSplice] = useState<Splice>()
  const [string, setString] = useState('')
  const [artifact, setArtifact] = useState<T>()
  if (!pid) {
    return
  }
  log('useArtifact %s %s', path, print(pid))
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
  const api = useTerminal()

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
  log('useSplice %s', print(pid), path)
  return splice
}

export const useArtifactBytes = (pid: PID, path: string) => {
  // used to access raw Uint8Array data
  log('useRawArtifact %s', print(pid), path)
  throw new Error('not implemented')
}

export const usePing = () => {
  const terminal = useTerminal()
  return (...args: Parameters<typeof terminal.ping>) => terminal.ping(...args)
}

export const useDNS = (repo: string) => {
  const terminal = useTerminal()
  const [pid, setPid] = useState<PID>()
  const setError = useError()
  useEffect(() => {
    let active = true
    if (!terminal) {
      return
    }
    terminal
      .dns(repo)
      .then((pid) => {
        if (active) {
          setPid(pid)
        }
      })
      .catch(setError)
    return () => {
      active = false
    }
  }, [terminal, repo])
  return pid
}

export const useHAL = (createNew = false) => {
  const halPid = useDNS('dreamcatcher-tech/HAL')
  const terminal = useTerminal()
  const [halSessionPid, setHalSessionPid] = useState<PID>()
  const setError = useError()
  useEffect(() => {
    let active = true
    if (!halPid || !terminal) {
      return
    }
    const session = recoverHal(halPid, terminal.pid, createNew)

    terminal
      .ensureBranch(session, halPid)
      .then(() => {
        if (active) {
          log('hal session %s', print(session))
          setHalSessionPid(session)
        }
      })
      .catch(setError)
    return () => {
      active = false
    }
  }, [terminal, halPid, createNew])
  return halSessionPid
}

export const useActions = (isolate: string, pid?: PID) => {
  const artifact = useTerminal()
  const [actions, setActions] = useState<DispatchFunctions>()
  const [error, setError] = useState()
  useEffect(() => {
    log('useActions', isolate, artifact)
    if (!pid) {
      return
    }
    let active = true
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
      await actions.engage({ help, text })
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
  log('useLatestCommit %s', print(pid), splice)
  return splice
}
export const useError = () => {
  const [error, setError] = useState<Error>()
  if (error) {
    throw error
  }
  return setError
}
export const useTranscribe = () => {
  const api = useTerminal()
  const transcribe = useCallback(
    async (audio: File) => {
      const transcription = await api.transcribe({ audio })
      return transcription.text
    },
    [api]
  )
  return transcribe
}
const recoverHal = (halPid: PID, terminalPid: PID, create = false) => {
  let sessionId = sessionStorage.getItem('hal-session')
  if (create) {
    sessionId = null
  }
  if (!sessionId) {
    sessionId = ulid()
    sessionStorage.setItem('hal-session', sessionId)
    log('new hal sessionId', sessionId)
  } else {
    log('recovered hal sessionId', sessionId)
  }
  const actorId = getActorId(terminalPid)
  const branches = [...halPid.branches, actorId, sessionId]
  const session = { ...halPid, branches }
  freezePid(session)
  return session
}
