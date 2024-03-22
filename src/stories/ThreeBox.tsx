import Input from './Input'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { FC, useCallback, useState } from 'react'
import Debug from 'debug'
import Messages from './Messages.tsx'
import { useArtifact, useSession } from '../react/hooks'
import Git from './Git.tsx'
import { MessageParam } from '../constants.ts'

// TODO put the git commit hash under the input box, along with date, time,
// who the current user is, size, latency, etc.

const debug = Debug('AI:ThreeBox')
interface ThreeBox {
  preload: string
  presubmit: boolean
}
const ThreeBox: FC<ThreeBox> = ({ preload, presubmit }) => {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const onTranscribe = useCallback((isTranscribing: boolean) => {
    setIsTranscribing(isTranscribing)
  }, [])
  const { pid } = useSession()
  const messages = useArtifact<MessageParam[]>('session.json', pid) || []
  debug('messages', messages, 'pid', pid)
  if (!pid) {
    return null
  }
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        // height: '100%',
        // width: '100%',
        justifyContent: 'center',
      }}
    >
      <Stack
        direction='column'
        alignItems='flex-start'
        justifyContent='flex-end'
        pb={3}
        pr={1}
        sx={{
          minHeight: '100%',
          minWidth: '800px',
          maxWidth: '800px',
        }}
      >
        <Messages messages={messages} isTranscribing={isTranscribing} />
        <Input
          preload={preload}
          presubmit={presubmit}
          onTranscribe={onTranscribe}
        />
        <Git pid={pid} />
      </Stack>
      {/* <Box sx={{ flexGrow: 1, p: 1 }}>
        <Paper elevation={6} sx={{ height: '100%', flexGrow: 1 }}>
          <StateBoard />
        </Paper>
      </Box> */}
    </Box>
  )
}

export default ThreeBox
