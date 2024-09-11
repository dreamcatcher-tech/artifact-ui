import Debug from 'debug'
import {
  useBackchatThread,
  usePrompt,
  useThread,
  useTranscribe,
  getThreadTriad,
  useBackchat,
} from './react/hooks.ts'
import Container from './stories/Container.tsx'
import { useEffect, useState } from 'react'
import { PID } from './constants.ts'
import equal from 'fast-deep-equal'
const log = Debug('AI:App')
Debug.enable('AI:App')

function App() {
  const backchat = useBackchat()
  const { thread, splice } = useBackchatThread()

  const remoteTriad = getThreadTriad(thread?.remote)
  const remoteThread = useThread(remoteTriad)

  const prompt = usePrompt()
  const transcribe = useTranscribe()

  const backchatProps = { inputProps: { prompt, transcribe }, thread, splice }
  const remoteProps = { ...remoteThread, inputProps: { prompt, transcribe } }

  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const abort = new AbortController()
    window.addEventListener(
      'hashchange',
      () => {
        log('hashchange', window.location.hash)
        setHash(window.location.hash)
      },
      abort
    )
    return () => abort.abort()
  }, [])

  const [remote, setRemote] = useState<PID | undefined>(thread?.remote)
  if (!equal(remote, thread?.remote)) {
    setRemote(thread?.remote)
  }

  const isThreadLoaded = !!thread
  useEffect(() => {
    if (!isThreadLoaded) {
      return
    }
    // but if there's no remote, the fragment should be current thread

    const { branches } = parseHashFragment()
    if (isFragmentSynced(branches, remote)) {
      return
    }
    backchat
      .changeRemote({ ...backchat.pid, branches })
      .then(() => {
        console.log('remote changed')
      })
      .catch((error) => {
        // TODO error should reset the fragment
        log('error changing remote', error)
      })
  }, [isThreadLoaded, remote, hash, backchat])

  return (
    <Container
      backchat={backchatProps}
      remote={remoteProps}
      showRemoteInitially={!!remoteThread.thread}
    />
  )
}

const parseHashFragment = () => {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const string = params.get('branches')
  if (!string) {
    return { branches: [] }
  }
  return { branches: string.split('/') }
}

// const setFragment = (branches: string[]) => {
//   const params = new URLSearchParams({ branches: branches.join('/') })
//   window.location.hash = params.toString()
//   console.log('setFragment', window.location.hash)
// }
const isFragmentSynced = (branches: string[], remote?: PID) => {
  if (!remote) {
    return !branches.length
  }
  return equal(remote.branches, branches)
}

export default App
