import useSWR from 'swr'
import { ArtifactContext } from '../react/Provider.tsx'
import { useCallback, useContext, useEffect, useState } from 'react'
import Debug from 'debug'
import { DispatchFunctions, PID } from '../../constants.ts'
const debug = Debug('AI:hooks')

const useAPI = () => {
  const { artifact } = useContext(ArtifactContext)
  return artifact
}

export const usePing = () => {
  const api = useAPI()
  return (...args: Parameters<typeof api.ping>) => api.ping(...args)
}

export const usePierces = (isolate: string, pid: PID) => {
  const artifact = useAPI()
  const [actions, setActions] = useState<DispatchFunctions>()
  const [error, setError] = useState()
  if (error) {
    throw error
  }
  useEffect(() => {
    debug('useActions', isolate, artifact)
    let active = true
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
  }, [artifact, isolate])
  return actions
}

export const useSession = () => {
  // start a new session if we don't have one, or use current session
}

export const useGoalie = (pid: PID) => {
  const actions = usePierces('engage-help', pid)

  const prompt = useCallback(
    async (text: string) => {
      if (!actions || !actions.engageInBand) {
        return
      }
      const result = await actions.engageInBand({ help: 'goalie', text })
      return result
    },
    [actions]
  )
  if (!actions || !actions.engageInBand) {
    return
  }
  return prompt
}

export const useCommits = (depth = 1, path = '/') => {
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
  // const commits = useCommits(1, path)
  // return commits[0]
}
