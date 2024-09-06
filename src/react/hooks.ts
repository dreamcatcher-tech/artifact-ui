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
  Triad,
  PathTriad,
  getThreadPath,
  threadSchema,
} from '../api/types.ts'
import posix from 'path-browserify'
import { ulid } from 'ulid'
import { assertObject } from '@sindresorhus/is'
import { z } from 'zod'
const log = Debug('AI:hooks')

export const useBackchat = (): Backchat => {
  const { backchat } = useContext(ArtifactContext)
  return backchat
}
const useArtifact = (triad?: PathTriad) => {
  const splice = useSplice(triad)
  const [lastSplice, setLastSplice] = useState<Splice>()
  const [contents, setContents] = useState<string>()
  const { path } = triad || {}
  if (!equal(lastSplice, splice)) {
    setLastSplice(splice)
  }

  if (path && lastSplice && lastSplice.changes) {
    if (lastSplice.changes[path]) {
      const { patch } = lastSplice.changes[path]
      if (patch && contents !== patch) {
        setContents(patch)
      }
    }
  }
  return { splice: lastSplice, contents }
}
export const useArtifactJSON = <T extends z.ZodType>(
  triad?: PathTriad,
  schema?: T
) => {
  const { splice, contents } = useArtifact(triad)
  if (!triad) {
    return { json: undefined, splice: undefined }
  }
  let json: z.infer<T> | undefined
  if (contents) {
    json = JSON.parse(contents)
    if (schema) {
      json = schema.parse(json) as z.infer<T>
    }
  }
  return { splice, json }
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
export const useBackchatThread = () => {
  const backchat = useBackchat()
  const [target, setTarget] = useState<PID>()
  const setError = useError()

  useEffect(() => {
    // BUT this needs to be watching the state in backchat, to detect changes
    // const path = '.io.json'
    // const { pid } = backchat
    // const io = useArtifactJSON({ pid, path }, ioSt)
    let active = true
    backchat
      .readBaseThread()
      .then((pid) => {
        if (active) {
          setTarget(pid)
        }
      })
      .catch(setError)
    return () => {
      active = false
    }
  }, [setError, backchat])
  const triad = target
    ? { path: getThreadPath(target), pid: target }
    : undefined
  return useThread(triad)
}

export const useThread = (triad?: PathTriad) => {
  const { splice, json: thread } = useArtifactJSON(triad, threadSchema)
  return { splice, thread }
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
export const usePrompt = () => {
  const backchat = useBackchat()
  const prompt = useCallback(
    async (content: string) => {
      log('prompt', content)
      await backchat.prompt(content)
    },
    [backchat]
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

// TODO recovery of sessions
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
