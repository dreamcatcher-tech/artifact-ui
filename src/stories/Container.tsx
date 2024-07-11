import ThreeBox, { type ThreeBoxProps } from './ThreeBox.tsx'
import BackchatDialog from './Backchat.tsx'
import { FC, useCallback, useState } from 'react'

export interface ContainerProps {
  focus: ThreeBoxProps
  backchat: ThreeBoxProps
  showBackchat: boolean
}
const Container: FC<ContainerProps> = ({ focus, backchat, showBackchat }) => {
  const [open, setOpen] = useState(showBackchat)
  const handleClose = useCallback(() => setOpen(false), [setOpen])
  const handleBackchat = useCallback(() => setOpen(true), [setOpen])
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
