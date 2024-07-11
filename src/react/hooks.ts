import equal from 'fast-deep-equal'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import {
  Splice,
  Backchat,
  PID,
  print,
  getActorId,
  freezePid,
  ApiFunctions,
  Thread,
  Triad,
  PathTriad,
  BackchatThread,
  addBranches,
} from '../api/web-client.types.ts'
import posix from 'path-browserify'
import { ulid } from 'ulid'
import { assert, assertObject } from '@sindresorhus/is'
import { ThreeBoxProps } from '../stories/ThreeBox.tsx'
const log = Debug('AI:hooks')

export const useBackchat = (): Backchat => {
  const { backchat } = useContext(ArtifactContext)
  assert.nonEmptyObject(backchat, 'backchat undefined')
  return backchat
}
export const useArtifactString = (triad?: PathTriad): string | undefined => {
  if (!triad) {
    return
  }
  const { path, pid, commit } = triad
  const { string } = useArtifactBundle({ path, pid, commit })
  return string
}
const useArtifactBundle = ({
  path,
  pid,
  commit,
}: PathTriad): { splice?: Splice; string?: string } => {
  const splice = useSplice({ pid, path, commit })
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
  return { splice, string }
}
export const useArtifact = <T>({
  path,
  pid,
  commit,
}: PathTriad): T | undefined => {
  const string = useArtifactString({ path, pid, commit })
  if (string) {
    return JSON.parse(string) as T
  }
}

export const useSplice = ({ pid, path, commit }: Partial<Triad>) => {
  if (path && posix.isAbsolute(path)) {
    throw new Error(`path must be relative: ${path}`)
  }
  const [splice, setSplice] = useState<Splice>()
  const backchat = useBackchat()

  useEffect(() => {
    if (!pid || !backchat) {
      return
    }
    const abort = new AbortController()
    const consume = async () => {
      // TODO move this to be for direct one off reads
      const after = commit
      for await (const splice of backchat.read(
        pid,
        path,
        after,
        abort.signal
      )) {
        log('splice', splice)
        setSplice(splice)
      }
    }
    consume()
    return () => abort.abort()
  }, [backchat, pid, path, commit])
  if (!pid) {
    return
  }
  log('useSplice %s', print(pid), path)
  return splice
}

export const useArtifactBytes = ({ pid, path, commit }: PathTriad) => {
  // used to access raw Uint8Array data
  log('useRawArtifact %s', print(pid), path, commit)
  throw new Error('not implemented')
}

export const usePing = () => {
  const backchat = useBackchat()
  return (...args: Parameters<typeof backchat.ping>) => backchat.ping(...args)
}

export const useDNS = (repo: string) => {
  const backchat = useBackchat()
  const [pid, setPid] = useState<PID>()
  const setError = useError()
  useEffect(() => {
    let active = true
    if (!backchat) {
      return
    }
    backchat
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
  }, [backchat, repo, setError])
  return pid
}

export const useActions = (isolate: string, target?: PID) => {
  const backchat = useBackchat()
  const [actions, setActions] = useState<ApiFunctions>()
  const [error, setError] = useState()
  useEffect(() => {
    if (!target) {
      return
    }
    log('useActions', isolate, backchat)
    let active = true
    // TODO listen to changes in the available actions
    backchat
      .actions(isolate, { target })
      .then((actions) => {
        if (active) {
          setActions(actions)
        }
      })
      .catch(setError)

    return () => {
      active = false
    }
  }, [target, backchat, isolate])
  if (error) {
    throw error
  }
  return actions
}
export const usePrompt = (threadId: string) => {
  const backchat = useBackchat()
  const prompt = useCallback(
    async (text: string) => {
      log('prompt', text)
      if (!backchat) {
        throw new Error('backchat is not yet defined')
      }
      return await backchat.prompt(text, threadId)
    },
    [backchat, threadId]
  )
  if (backchat) {
    return prompt
  }
}

export const useBackchatThread = (): ThreeBoxProps & { focusId?: string } => {
  const { threadId, pid } = useBackchat()
  return useThreadBundle(threadId, pid)
}
export const useThread = (threadId?: string) => {
  const backchat = useBackchat()
  const pid = threadId ? addBranches(backchat.pid, threadId) : undefined
  return useThreadBundle(threadId, pid)
}

const useThreadBundle = (threadId?: string, pid?: PID) => {
  const path = 'threads/' + threadId
  const { splice, string } = useArtifactBundle({ path, pid })
  let thread: Thread | undefined
  let focusId: string | undefined
  if (string) {
    const { focus, ...rest }: BackchatThread = JSON.parse(string)
    focusId = focus
    thread = rest
  }
  const mdSource = thread ? thread.agent.source : undefined
  const md = useArtifactString(mdSource)
  return { thread, threadId, splice, md, focusId }
}

export const useLatestCommit = (pid?: PID): Splice | undefined => {
  const splice = useSplice({ pid })
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
  const api = useBackchat()
  const transcribe = useCallback(
    async (audio: File) => {
      const transcription = await api.transcribe({ audio })
      return transcription.text
    },
    [api]
  )
  return transcribe
}

export const recoverHal = (halPid: PID, terminalPid: PID, create = false) => {
  let fragment = parseHashFragment()
  if (create) {
    fragment = undefined
  }
  if (!fragment) {
    const sessionId = ulid()
    const actorId = getActorId(terminalPid)
    setFragment(actorId, sessionId)
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

const setFragment = (actor: string, thread: string) => {
  const params = new URLSearchParams({ actor, thread })
  window.location.hash = params.toString()
}
