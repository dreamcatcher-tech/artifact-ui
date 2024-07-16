import {
  useBackchatThread,
  usePrompt,
  useThread,
  useTranscribe,
} from './react/hooks.ts'
import Container from './stories/Container.tsx'
import { ThreeBoxProps } from './stories/ThreeBox.tsx'

// export interface ThreeBoxProps {
//   threadId: string
//   thread: Thread
//   splice: Splice
//   md?: string
//   inputProps?: InputProps
//   handleBackchat?: () => void
// }
// export interface InputProps {
//   prompt?: (text: string) => Promise<void>
//   transcribe?: (audio: File) => Promise<string>
//   onRecording?: (isRecording: boolean) => void
//   handleBackchat?: () => void
//   preload?: string
//   presubmit?: boolean
// }

function App() {
  // here we would assemble the state prop and drop it in
  // - the splice of the thread, possibly cached
  // - the thread
  // - the splice of backchat
  // - the backchat thread
  // - transcribe function
  // - prompt function, targetted to the scoped thread

  // we can use the props interfaces to describe slices on the top level prop

  const { focusId, ...backchatData } = useBackchatThread()
  const focusData = useThread(focusId)
  const showBackchat = focusId === backchatData.threadId
  const prompt = usePrompt(focusId)
  const transcribe = useTranscribe()
  const focus: ThreeBoxProps = {
    ...focusData,
    inputProps: { prompt, transcribe },
  }
  const backchatPrompt = usePrompt(backchatData.threadId)
  const backchat: ThreeBoxProps = {
    ...backchatData,
    inputProps: { transcribe, prompt: backchatPrompt },
  }

  return (
    <Container focus={focus} backchat={backchat} showBackchat={showBackchat} />
  )
}

export default App
