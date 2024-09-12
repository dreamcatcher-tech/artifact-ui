import equal from 'fast-deep-equal'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import {
  Splice,
  Backchat,
  PID,
  print,
  ApiFunctions,
  Triad,
  PathTriad,
  ioStruct,
  backchatStateSchema,
} from '../api/types.ts'
import { RemoteTree, ThreadTreeWatcher } from './thread-tree-watcher.ts'
import posix from 'path-browserify'
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
export const useBranchState = <T extends z.ZodType>(schema: T, pid?: PID) => {
  const triad = { pid, path: '.io.json' }
  const { json } = useArtifactJSON(triad, ioStruct)
  if (!pid) {
    return
  }
  if (!json) {
    return
  }
  return schema.parse(json.state) as z.infer<T>
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
  const state = useBranchState(backchatStateSchema, backchat.pid)
  const [target, setTarget] = useState<PID>()

  if (!equal(target, state?.target)) {
    setTarget(state?.target)
  }

  const [tree, setTree] = useState<Partial<RemoteTree>>({})
  useEffect(() => {
    if (!target) {
      return
    }
    const watcher = ThreadTreeWatcher.watch(backchat, target, setTree)
    return () => watcher.stop()
  }, [target])

  return tree
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
  return useCallback(
    async (content: string, target: PID) => {
      log('prompt', content)
      await backchat.prompt(content, target)
    },
    [backchat]
  )
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
  const backchat = useBackchat()
  const transcribe = useCallback(
    async (audio: File) => {
      const transcription = await backchat.transcribe({ audio })
      return transcription.text
    },
    [backchat]
  )
  return transcribe
}
