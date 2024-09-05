import ThreeBox, { type ThreeBoxProps } from './ThreeBox.tsx'
import DeferredDialog from './DeferredThread.tsx'
import { FC, useCallback, useEffect, useState } from 'react'

export interface ContainerProps {
  deferred: ThreeBoxProps
  backchat: ThreeBoxProps
  showDeferred: boolean
}
const Container: FC<ContainerProps> = ({
  deferred,
  backchat,
  showDeferred,
}) => {
  const [open, setOpen] = useState(showDeferred)

  useEffect(() => {
    if (showDeferred) {
      setOpen(true)
    } else {
      setOpen(false)
    }
    console.log('show backchat changed:', showDeferred)
  }, [showDeferred])

  const handleClose = useCallback(() => setOpen(false), [setOpen])
  return (
    <>
      <ThreeBox {...backchat} />
      <DeferredDialog {...{ open, handleClose, ...deferred }} />
    </>
  )
}

export default Container
