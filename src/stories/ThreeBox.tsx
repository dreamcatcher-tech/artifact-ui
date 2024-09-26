import Input from './Input'
import Box from '@mui/material/Box'
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
import { Container, Left, Center } from './Glass.tsx'

const log = Debug('AI:ThreeBox')
export interface ThreeBoxProps {
  thread?: Thread
  splice?: Splice
  remote?: RemoteTree
  prompt: (content: string, target: PID) => Promise<void>
  transcribe: (audio: File) => Promise<string>
  agents?: string[]
}

const ThreeBox: FC<ThreeBoxProps> = ({
  thread,
  splice,
  remote,
  prompt,
  transcribe,
  agents,
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
      <Container>
        <Left>
          <Messages thread={thread} />
          <Box sx={{ height: (theme) => theme.spacing(2) }} />
          <Input prompt={scopedPrompt} transcribe={transcribe} />
          <ThreadInfo
            splice={splice}
            thread={thread}
            remote={remote}
            onRemote={onRemote}
            agents={agents}
          />
        </Left>
        <Center>
          <Paper
            elevation={6}
            sx={{
              flexGrow: 1,
              maxHeight: '100%',
              overflow: 'hidden',
              mt: 3,
              mr: 3,
              mb: 3,
            }}
          >
            <Stateboard
              widgets={['COMMIT_GRAPH', 'FILE_EXPLORER', 'MARKDOWN_EDITOR']}
              pid={splice?.pid}
            />
          </Paper>
        </Center>
      </Container>
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
