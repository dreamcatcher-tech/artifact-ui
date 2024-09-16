import Input from './Input'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { FC, useCallback, useEffect, useState } from 'react'
import Debug from 'debug'
import Messages from './Messages.tsx'
import ThreadInfo from './ThreadInfo.tsx'
import { PID, Splice, Thread } from '../constants.ts'
import { Paper } from '@mui/material'
import Stateboard from './Stateboard.tsx'
import { RemoteTree } from '../react/thread-tree-watcher.ts'
import RemoteThread from './RemoteThread.tsx'
import { setHashFragment } from '../react/fragment.ts'

const log = Debug('AI:ThreeBox')
export interface ThreeBoxProps {
  thread?: Thread
  splice?: Splice
  remote?: RemoteTree
  prompt: (content: string, target: PID) => Promise<void>
  transcribe: (audio: File) => Promise<string>
}

const ThreeBox: FC<ThreeBoxProps> = ({
  thread,
  splice,
  remote,
  prompt,
  transcribe,
}) => {
  const messages = thread?.messages || []
  log('messages', messages)

  const scopedPrompt = useCallback(
    (content: string) => {
      if (!splice?.pid) {
        throw new Error('no pid in splice yet')
      }
      if (!prompt) {
        throw new Error('no prompt')
      }
      return prompt(content, splice.pid)
    },
    [prompt, splice?.pid]
  )

  const [open, setOpen] = useState(false)

  const onRemote = useCallback(() => {
    if (!remote) {
      return
    }
    setHashFragment(remote?.splice.pid.branches)
    setOpen(true)
  }, [setOpen, remote])
  const handleClose = useCallback(() => {
    if (!splice) {
      return
    }
    setHashFragment(splice.pid.branches)
    setOpen(false)
  }, [setOpen, splice])

  const [initialOpen, setInitialOpen] = useState(false)
  useEffect(() => {
    if (!remote || initialOpen) {
      return
    }
    setInitialOpen(true)
    onRemote()
  }, [initialOpen, remote, onRemote])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Stack
          direction='column'
          justifyContent='flex-end'
          sx={{
            height: '100%',
            maxWidth: '800px',
            flexGrow: 0.5,
            ml: 3,
            mr: 3,
          }}
        >
          <Messages thread={thread} />
          <Box sx={{ height: (theme) => theme.spacing(2) }} />
          <Input prompt={scopedPrompt} transcribe={transcribe} />
          <ThreadInfo splice={splice} remote={remote} onRemote={onRemote} />
        </Stack>
        <Paper
          elevation={6}
          sx={{
            flexGrow: 1,
            maxHeight: '100%',
            overflow: 'hidden',
            p: 3,
            mt: 3,
            mr: 3,
            mb: 3,
          }}
        >
          <Stateboard widgets={['FILE_EXPLORER']} pid={splice?.pid} />
        </Paper>
      </Box>
      {remote && (
        <RemoteThread
          open={open}
          handleClose={handleClose}
          prompt={prompt}
          transcribe={transcribe}
          {...remote}
        />
      )}
    </>
  )
}

export default ThreeBox
