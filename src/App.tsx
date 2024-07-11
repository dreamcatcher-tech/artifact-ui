import { useBackchatThread, useThread } from './react/hooks.ts'
import Container from './stories/Container.tsx'

// export interface ThreeBoxProps {
//   threadId: string
//   thread: Thread
//   splice: Splice
//   md?: string
//   inputProps?: InputProps
//   handleBackchat?: () => void
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

  const { focusId, ...backchat } = useBackchatThread()
  const focus = useThread(focusId)
  const showBackchat = focusId === backchat.threadId

  return (
    <Container focus={focus} backchat={backchat} showBackchat={showBackchat} />
  )
}

export default App

// try make a standard set of scenarios, and allow all subcomponents to show
// their own narrow version of this
