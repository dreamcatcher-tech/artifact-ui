import Debug from 'debug'
import {
  useBackchatThread,
  usePrompt,
  useThread,
  useTranscribe,
} from './react/hooks.ts'
import Container from './stories/Container.tsx'
import { ThreeBoxProps } from './stories/ThreeBox.tsx'
const log = Debug('AI:App')
Debug.enable('AI:App AI:hooks')

// export interface ThreeBoxProps {
//   threadId: string
//   thread: Thread
//   splice: Splice
//   md?: string
//   inputProps?: InputProps
//   handleBackchat?: () => void
// }

function App() {
  const { focusId, ...backchatData } = useBackchatThread()
  const focusData = useThread(focusId)
  const showBackchat = !focusId || focusId === backchatData.threadId
  const prompt = usePrompt(focusId)
  const transcribe = useTranscribe()
  const focus: ThreeBoxProps = {
    ...focusData,
    inputProps: { prompt, transcribe },
  }
  log('focus id:', focusId)

  const backchatPrompt = usePrompt(backchatData.threadId)
  const backchat: ThreeBoxProps = {
    ...backchatData,
    inputProps: { transcribe, prompt: backchatPrompt },
  }
  log('backchat prompt id:', backchatData.threadId)

  log('backchat data', backchatData)
  log('focus data', focusData)
  log('showBackchat', showBackchat)

  return (
    <Container focus={focus} backchat={backchat} showBackchat={showBackchat} />
  )
}

export default App
