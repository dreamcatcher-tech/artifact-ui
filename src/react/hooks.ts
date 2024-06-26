import equal from 'fast-deep-equal'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import {
  Splice,
  ArtifactTerminal,
  DispatchFunctions,
  PID,
  print,
  getActorId,
  freezePid,
} from '../api/web-client.types.ts'
import posix from 'path-browserify'
import { ulid } from 'ulid'
import { assertObject } from '@sindresorhus/is'
const log = Debug('AI:hooks')

export const useTerminal = (): ArtifactTerminal => {
  const { session } = useContext(ArtifactContext)
  return session
}
export const useArtifactString = (
  path?: string,
  pid?: PID
): string | undefined => {
  const splice = useSplice(pid, path)
  const [lastSplice, setLastSplice] = useState<Splice>()
  const [string, setString] = useState<string>()
  if (path && splice && splice.changes && !equal(lastSplice, splice)) {
    setLastSplice(splice)
    if (splice.changes[path]) {
      const { patch } = splice.changes[path]
      if (patch && string !== patch) {
        setString(patch)
      }
    }
  }
  return string
}
export const useArtifact = <T>(path: string, pid?: PID): T | undefined => {
  const splice = useSplice(pid, path)
  const [lastSplice, setLastSplice] = useState<Splice>()
  const [string, setString] = useState('')
  const [artifact, setArtifact] = useState<T>()
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
        log('splice', splice)
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
  }, [terminal, repo, setError])
  return pid
}

const useHalSession = (createNew = false) => {
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
  }, [terminal, halPid, createNew, setError])
  return halSessionPid
}

export const useActions = (isolate: string, pid?: PID) => {
  const terminal = useTerminal()
  const [actions, setActions] = useState<DispatchFunctions>()
  const [error, setError] = useState()
  useEffect(() => {
    log('useActions', isolate, terminal)
    if (!pid) {
      return
    }
    let active = true
    // TODO listen to changes in the available actions
    terminal
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
  }, [pid, terminal, isolate])
  if (error) {
    throw error
  }
  return actions
}
export const useHAL = () => {
  const session = useHalSession()
  const actions = useActions('hal', session)
  const prompt = useCallback(
    async (text: string) => {
      log('prompt', text, actions)
      if (!actions || !actions.prompt) {
        throw new Error('actions.prompt is not defined')
      }
      await actions.prompt({ text })
    },
    [actions]
  )
  if (!actions || !actions.prompt) {
    return {}
  }
  return { prompt, session }
}

export const useLatestCommit = (pid?: PID): Splice | undefined => {
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
  let fragment = parseHashFragment()
  if (create) {
    fragment = undefined
  }
  if (!fragment) {
    const sessionId = ulid()
    const actorId = getActorId(terminalPid)
    fragment = setFragment(actorId, sessionId)
    log('new hal sessionId set')
  } else {
    log('recovered hal fragment')
  }
  assertObject(fragment, 'fragment error')
  const { actorId, sessionId } = fragment
  const branches = [...halPid.branches, actorId, sessionId]
  const session = { ...halPid, branches }
  freezePid(session)
  return session
}

const parseHashFragment = () => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const actorId = params.get('actorId')
  const sessionId = params.get('sessionId')
  if (actorId && sessionId) {
    return { actorId, sessionId }
  }
}

const setFragment = (actorId: string, sessionId: string) => {
  const params = new URLSearchParams({ actorId, sessionId })
  window.location.hash = params.toString()
  return { actorId, sessionId }
}
