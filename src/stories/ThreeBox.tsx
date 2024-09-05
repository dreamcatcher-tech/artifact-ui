import Input, { InputProps } from './Input'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { FC } from 'react'
import Debug from 'debug'
import Messages from './Messages.tsx'
import ThreadInfo from './ThreadInfo.tsx'
import { Splice, Thread } from '../constants.ts'

const log = Debug('AI:ThreeBox')
export interface ThreeBoxProps {
  thread?: Thread
  splice?: Splice
  inputProps?: InputProps
}

const ThreeBox: FC<ThreeBoxProps> = ({ thread, splice, inputProps }) => {
  const messages = thread?.messages || []
  log('messages', messages)
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'center',
      }}
    >
      <Stack
        direction='column'
        alignItems='flex-start'
        justifyContent='flex-end'
        pb={3}
        sx={{
          minHeight: '100%',
          maxWidth: '800px',
          width: '100%',
          flexGrow: 1,
        }}
      >
        <Messages thread={thread} />
        <Input {...inputProps} />
        <ThreadInfo splice={splice} />
      </Stack>
      {/* <Box sx={{ flexGrow: 1, p: 1 }}>
        <Paper elevation={6} sx={{ height: '100%', flexGrow: 1 }}>
          <Stateboard />
        </Paper>
      </Box> */}
    </Box>
  )
}

export default ThreeBox
