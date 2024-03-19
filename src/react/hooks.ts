import { SessionContext } from '../stories/Session.tsx'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import { Cradle, DispatchFunctions, PID } from '../api/web-client.types.ts'
import posix from 'path-browserify'
const log = Debug('AI:hooks')

const useAPI = (): Cradle => {
  const { artifact } = useContext(ArtifactContext)
  return artifact
}
export const useArtifactPatches = (pid: PID, path: string) => {
  log('useArtifactPatches', pid, path)
  // gets the stream of patches for an object
  // must be a json object
  // could stream directories too ?
}
export const useArtifact = (pid: PID, path: string) => {
  if (!posix.isAbsolute(path)) {
    throw new Error(`path must be absolute: ${path}`)
  }
  log('useArtifact', pid, path)
  /**
   * This is a json object.
   * It returns a patch object with the full contents of the file.
   * Large files might be sent as multiple patches
   * If the file changes, patches will be streamed down
   * A local fully patched object is stored, so that future callers will get
   * that full object then the patches which come after.
   *
   * Consumers always get the full object ?
   */
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
  log('artifact', artifact)
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

export const useCommits = (depth = 1, path = '/') => {
  log('useCommits', depth, path)
  // should be able to trace it to always get the latest ones
  // the format should be in a stream of splices
  // assert(Number.isInteger(depth), `depth must be an integer: ${depth}`)
  // assert(depth > 0, `depth must be greater than 0: ${depth}`)
  // // TODO fix pathing
  // //   assert(posix.isAbsolute(path), `path must be absolute: ${path}`)
  // const { artifact } = useContext(ArtifactContext)
  // const [commits, setCommits] = useState([])
  // useEffect(() => {
  //   if (!artifact) {
  //     return
  //   }
  //   let active = true
  //   const subscriptionPromise = artifact.subscribeCommits(path, () => {
  //     if (!active) {
  //       return
  //     }
  //     // TODO get the root
  //     artifact.log({ filepath: path, depth }).then(setCommits)
  //   })
  //   return () => {
  //     debug('useCommits unmount', path)
  //     active = false
  //     subscriptionPromise.then((unsubscribe) => unsubscribe())
  //   }
  // }, [depth, artifact, path])
  // return commits
}

export const useLatestCommit = (path = '/') => {
  log('useLatestCommit', path)
  // const commits = useCommits(1, path)
  // return commits[0]
}
export const useError = () => {
  const [error, setError] = useState()
  if (error) {
    throw error
  }
  return setError
}
