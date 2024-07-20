import ThreeBox, { type ThreeBoxProps } from './ThreeBox.tsx'
import BackchatDialog from './Backchat.tsx'
import { FC, useCallback, useEffect, useState } from 'react'

export interface ContainerProps {
  focus: ThreeBoxProps
  backchat: ThreeBoxProps
  showBackchat: boolean
}
const Container: FC<ContainerProps> = ({ focus, backchat, showBackchat }) => {
  // if the top changes whether we should
  // if we are at the history tip, then we should follow the top level changes
  // but only if the top level switches
  useEffect(() => {
    if (showBackchat) {
      setOpen(true)
    } else {
      setOpen(false)
    }
    console.log('show backchat changed:', showBackchat)
  }, [showBackchat])

  const [open, setOpen] = useState(showBackchat)
  const handleClose = useCallback(() => setOpen(false), [setOpen])
  const handleBackchat = useCallback(() => {
    console.log('handle backchat')
    setOpen(true)
  }, [setOpen])
  console.log('open:', open)
  return (
    <>
      <ThreeBox {...focus} handleBackchat={handleBackchat} />
      <BackchatDialog {...{ open, handleClose, ...backchat }} />
    </>
  )
}

export default Container

// if there was just a single set of stories, and we make data for all of them,
// then generate whatever we can at the top level
