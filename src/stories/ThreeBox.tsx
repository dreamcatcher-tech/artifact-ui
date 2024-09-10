import Input, { InputProps } from './Input'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { FC } from 'react'
import Debug from 'debug'
import Messages from './Messages.tsx'
import ThreadInfo from './ThreadInfo.tsx'
import { Splice, Thread } from '../constants.ts'
import { Paper } from '@mui/material'
import Stateboard from './Stateboard.tsx'

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
        <Input {...inputProps} />
        <ThreadInfo splice={splice} />
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
        <Stateboard widgets={['FILE_EXPLORER']} />
      </Paper>
    </Box>
  )
}

export default ThreeBox
