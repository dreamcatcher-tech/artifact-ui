import ThreeBox, { type ThreeBoxProps } from './stories/ThreeBox.tsx'

function App() {
  // here we would assemble the state prop and drop it in
  // - the splice of the thread, possibly cached
  // - the thread
  // - the splice of backchat
  // - the backchat thread
  // - transcribe function
  // - prompt function, targetted to the scoped thread

  // we can use the props interfaces to describe slices on the top level prop

  const threeBox: ThreeBoxProps = {} as ThreeBoxProps

  return (
    <>
      <ThreeBox {...threeBox} />
    </>
  )
}

export default App

// try make a standard set of scenarios, and allow all subcomponents to show
// their own narrow version of this
