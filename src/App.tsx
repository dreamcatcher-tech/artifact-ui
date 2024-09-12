import Debug from 'debug'
import {
  useBackchatThread,
  usePrompt,
  useTranscribe,
  useBackchat,
} from './react/hooks.ts'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useEffect } from 'react'
import ThreeBox from './stories/ThreeBox.tsx'
const log = Debug('AI:App')
Debug.enable('AI:App')

function App() {
  const backchat = useBackchat()
  const { thread, splice, remote } = useBackchatThread()

  const prompt = usePrompt()
  const transcribe = useTranscribe()

  useEffect(() => {
    if (!splice) {
      return
    }
    const { branches } = parseHashFragment()
    if (!branches.length) {
      setFragment(splice.pid.branches)
    }
  }, [splice])

  useEffect(() => {
    const { branches } = parseHashFragment()
    if (!branches.length) {
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
  }, [backchat])

  return (
    <DndProvider backend={HTML5Backend}>
      <ThreeBox {...{ prompt, transcribe, thread, splice, remote }} />
    </DndProvider>
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

const setFragment = (branches: string[]) => {
  window.location.hash = 'branches=' + branches.join('/')
  console.log('setFragment', window.location.hash)
}

export default App
