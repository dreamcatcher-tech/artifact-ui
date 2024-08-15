import equal from 'fast-deep-equal'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
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
  addPeer,
} from '../api/types.ts'
import posix from 'path-browserify'
import { ulid } from 'ulid'
import { assertObject } from '@sindresorhus/is'
import { ThreeBoxProps } from '../stories/ThreeBox.tsx'
const log = Debug('AI:hooks')

export const useBackchat = (): Backchat => {
  const { backchat } = useContext(ArtifactContext)
  return backchat
}
export const useArtifactString = (triad?: PathTriad): string | undefined => {
  const { string } = useArtifactBundle(triad)
  return string
}
const useArtifactBundle = (
  triad?: PathTriad
): { splice?: Splice; string?: string } => {
  const splice = useSplice(triad)
  const [lastSplice, setLastSplice] = useState<Splice>()
  const [string, setString] = useState<string>()
  const { path } = triad || {}
  if (!equal(lastSplice, splice)) {
    setLastSplice(splice)
  }

  if (path && lastSplice && lastSplice.changes) {
    if (lastSplice.changes[path]) {
      const { patch } = lastSplice.changes[path]
      if (patch && string !== patch) {
        setString(patch)
      }
    }
  }
  return { splice: lastSplice, string }
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

export const useSplice = (triad?: Partial<Triad>) => {
  const [splice, setSplice] = useState<Splice>()
  const backchat = useBackchat()
  const [stableTriad, setTriad] = useState<Partial<Triad>>()
  useEffect(() => {
    setTriad((prev) => {
      if (triad && !equal(prev, triad)) {
        log('setTriad', triad)
        return triad
      }
      return prev
    })
  }, [triad])

  useEffect(() => {
    if (!stableTriad) {
      return
    }
    const abort = new AbortController()
    const { pid, path } = stableTriad
    if (!pid) {
      return
    }
    const consume = async () => {
      // TODO move this to be for direct one off reads
      const after = undefined // commit
      for await (const splice of backchat.watch(
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
    return () => {
      log('aborting useSplice')
      abort.abort('useSplice unmount')
    }
  }, [backchat, stableTriad])
  if (!stableTriad) {
    return
  }
  const { pid, path } = stableTriad
  if (path && posix.isAbsolute(path)) {
    throw new Error(`path must be relative: ${path}`)
  }
  if (!pid) {
    return
  }
  log('useSplice %s', print(pid), path)
  return splice
}
export const useBackchatThread = (): ThreeBoxProps & { focusId?: string } => {
  const { threadId, pid } = useBackchat()
  return useThreadBundle(threadId, pid)
}
export const useThread = (threadId?: string) => {
  // TODO cache the bundles
  // TODO blank what is returned whenever the threadId switches
  const backchat = useBackchat()
  const pid = threadId ? addPeer(backchat.pid, threadId) : undefined
  const bundle = useThreadBundle(threadId, pid)
  const { focusId, ...rest } = bundle
  return rest
}
const useThreadBundle = (threadId?: string, pid?: PID) => {
  const path = 'threads/' + threadId + '.json'
  const [thread, setThread] = useState<Thread>()
  const { splice, string } = useArtifactBundle({ path, pid })
  useEffect(() => {
    setThread(undefined)
  }, [threadId])
  const backchatThread = useMemo(() => {
    if (string) {
      return JSON.parse(string) as BackchatThread
    }
  }, [string])
  useEffect(() => {
    if (backchatThread) {
      const { focus, ...rest } = backchatThread
      setThread(rest)
    }
  }, [backchatThread])
  const focusId = backchatThread?.focus
  return { thread, threadId, splice, focusId }
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
  // TODO make target use deep equality, since it might be subject to change
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
export const usePrompt = (threadId?: string) => {
  const backchat = useBackchat()
  const prompt = useCallback(
    async (content: string) => {
      log('prompt', content)
      await backchat.prompt(content, threadId)
    },
    [backchat, threadId]
  )
  if (backchat) {
    return prompt
  }
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
