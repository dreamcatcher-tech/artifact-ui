import useSWR from 'swr'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
const debug = Debug('AI:hooks')

const useAPI = () => {
  const { artifact } = useContext(ArtifactContext)
  return artifact
}

export const usePing = () => {
  const api = useAPI()
  return (...args: Parameters<typeof api.ping>) => api.ping(...args)
}

export const useActions = (isolate) => {
  assert(!posix.isAbsolute(isolate), `path must be relative: ${isolate}`)
  const { artifact } = useContext(ArtifactContext)
  const [actions, setActions] = useState()
  const [error, setError] = useState()
  if (error) {
    throw error
  }
  useEffect(() => {
    debug('useActions', isolate, artifact)
    if (!artifact) {
      return
    }
    let active = true
    artifact
      .actions(isolate)
      .then((actions) => {
        if (active) {
          setActions(actions)
        }
      })
      .catch(setError)

    return () => {
      active = false
    }
  }, [artifact, isolate])
  return actions
}

export const usePierces = (isolate: string) => {
  // make a call to the isolateApi endpoint
  debug('usePierces', isolate)
}

export const useSession = () => {
  // start a new session if we don't have one, or use current session
}

export const usePrompt = () => {
  // must be in a PID session
  // so make a new one if one not running ?

  // can rely on useSession to get the PID
  const pid = useSession()

  // want to pierce the pid, then mutate the session file
  // to show pending data

  const { mutate } = useSWR({ path: '/api/prompt', pid })

  const prompt = useCallback(
    async (text) => {
      const response = await fetch('/api/prompt', {
        method: 'POST',
        body: JSON.stringify({ text, pid }),
      })
      const data = await response.json()
      mutate(data)
    },
    [pid, mutate]
  )

  const actions = useAPI('engage-help')

  useEffect(() => {
    if (!actions) {
      return
    }
    debug('setting prompt')
    const help = 'goalie'
    const { engageInBand } = actions
    const prompt = ({ text }) => engageInBand({ help, text })
    setPrompt(() => prompt)
  }, [actions])

  useEffect(() => {
    if (!prompt || !buffer.length) {
      return
    }
    for (const { resolve, text } of buffer) {
      debug('draining prompt buffer', text)
      prompt({ text }).then(resolve).catch(setError)
    }
    setBuffer([])
  }, [prompt])

  const bufferingPrompt = useCallback(
    async (text) => {
      assert(typeof text === 'string', `text must be a string`)
      assert(text, `text must not be empty`)
      if (!prompt) {
        debug('buffering prompt', text)
        let resolve
        const promise = new Promise((r) => (resolve = r))
        setBuffer((buffer) => [...buffer, { resolve, text }])
        return promise
      }
      debug('prompt', text)
      return await prompt({ text })
    },
    [prompt]
  )
  return bufferingPrompt
}

export const useCommits = (depth = 1, path = '/') => {
  assert(Number.isInteger(depth), `depth must be an integer: ${depth}`)
  assert(depth > 0, `depth must be greater than 0: ${depth}`)
  // TODO fix pathing
  //   assert(posix.isAbsolute(path), `path must be absolute: ${path}`)
  const { artifact } = useContext(ArtifactContext)
  const [commits, setCommits] = useState([])

  useEffect(() => {
    if (!artifact) {
      return
    }
    let active = true
    const subscriptionPromise = artifact.subscribeCommits(path, () => {
      if (!active) {
        return
      }
      // TODO get the root
      artifact.log({ filepath: path, depth }).then(setCommits)
    })
    return () => {
      debug('useCommits unmount', path)
      active = false
      subscriptionPromise.then((unsubscribe) => unsubscribe())
    }
  }, [depth, artifact, path])
  return commits
}

export const useLatestCommit = (path = '/') => {
  const commits = useCommits(1, path)
  return commits[0]
}
