import Debug from 'debug'
import {
  useBackchatThread,
  usePrompt,
  useThread,
  useTranscribe,
} from './react/hooks.ts'
import Container from './stories/Container.tsx'
import { ThreeBoxProps } from './stories/ThreeBox.tsx'
import { getThreadPath, PathTriad, PID } from './constants.ts'
const log = Debug('AI:App')
Debug.enable('AI:App AI:hooks')

function App() {
  const { thread, splice } = useBackchatThread()
  console.log('thread', thread)
  const deferredTriad = getTriad(thread?.defer)
  const deferredThread = useThread(deferredTriad)
  const prompt = usePrompt()
  const transcribe = useTranscribe()

  const backchat = { inputProps: { prompt, transcribe }, thread, splice }

  const deferred: ThreeBoxProps = {
    inputProps: { prompt, transcribe },
    thread: deferredThread.thread,
    splice: deferredThread.splice,
  }

  log('showBackchat', !deferred)

  return (
    <Container
      backchat={backchat}
      deferred={deferred}
      showDeferred={!deferred}
    />
  )
}

export default App

const getTriad = (defer?: PID) => {
  if (!defer) {
    return
  }
  const path = getThreadPath(defer)
  const triad: PathTriad = { path, pid: defer }
  return triad
}
