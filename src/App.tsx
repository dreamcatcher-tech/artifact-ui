import Debug from 'debug'
import {
  useBackchatThread,
  usePrompt,
  useTranscribe,
  useBackchat,
} from './react/hooks.ts'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useEffect, useState } from 'react'
import ThreeBox from './stories/ThreeBox.tsx'
import equal from 'fast-deep-equal'
import { PID } from './constants.ts'
import {
  isNewHashFragment,
  parseHashFragment,
  setHashFragment,
} from './react/fragment.ts'
const log = Debug('AI:App')
Debug.enable('AI:App')

function App() {
  const backchat = useBackchat()
  const { thread, splice, remote } = useBackchatThread()

  const prompt = usePrompt()
  const transcribe = useTranscribe()

  useEffect(() => {
    const { branches } = parseHashFragment()
    if (!branches.length) {
      return
    }
    if (!isNewHashFragment()) {
      return
    }
    console.log('new hash fragment', branches)

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

  const [pid, setPid] = useState<PID>()
  if (splice && splice.pid && !equal(splice.pid, pid)) {
    setPid(splice.pid)
  }
  useEffect(() => {
    if (!pid) {
      return
    }
    setHashFragment(pid.branches)
  }, [pid])

  return (
    <DndProvider backend={HTML5Backend}>
      <ThreeBox {...{ prompt, transcribe, thread, splice, remote }} />
    </DndProvider>
  )
}

export default App
