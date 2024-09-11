import ThreeBox, { type ThreeBoxProps } from './ThreeBox.tsx'
import DeferredDialog from './DeferredThread.tsx'
import { FC, useCallback, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export interface ContainerProps {
  remote: ThreeBoxProps
  backchat: ThreeBoxProps
  showRemoteInitially: boolean
}
const Container: FC<ContainerProps> = ({
  remote: deferred,
  backchat,
  showRemoteInitially,
}) => {
  const [open, setOpen] = useState(showRemoteInitially)

  useEffect(() => {
    if (showRemoteInitially) {
      setOpen(true)
    } else {
      setOpen(false)
    }
    console.log('show backchat changed:', showRemoteInitially)
  }, [showRemoteInitially])

  const showRemote = useCallback(() => setOpen(true), [setOpen])
  if (backchat.thread?.remote) {
    backchat.showRemote = showRemote
  }

  const handleClose = useCallback(() => setOpen(false), [setOpen])
  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <ThreeBox {...backchat} />
        <DeferredDialog {...{ open, handleClose, ...deferred }} />
      </DndProvider>
    </>
  )
}

export default Container
