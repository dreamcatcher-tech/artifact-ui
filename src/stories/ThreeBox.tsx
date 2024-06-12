import Input from './Input'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { FC } from 'react'
import Debug from 'debug'
import Messages from './Messages.tsx'
import { useArtifact, useHAL, useTerminal } from '../react/hooks'
import HALInfo from './Git.tsx'
import { MessageParam } from '../constants.ts'

// TODO put the git commit hash under the input box, along with date, time,
// who the current user is, size, latency, etc.

const log = Debug('AI:ThreeBox')
interface ThreeBox {
  preload?: string
  presubmit?: boolean
}
const ThreeBox: FC<ThreeBox> = ({ preload, presubmit }) => {
  const { pid } = useTerminal()
  const { session } = useHAL()
  const messages = useArtifact<MessageParam[]>('session.json', session) || []
  log('messages', messages, 'session', session)
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
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <Messages messages={messages} />
        <Input preload={preload} presubmit={presubmit} />
        <HALInfo pid={session} />
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
