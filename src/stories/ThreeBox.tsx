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
  stateboard?: boolean
}

const ThreeBox: FC<ThreeBoxProps> = ({
  thread,
  splice,
  inputProps,
  stateboard,
}) => {
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
          width: '100%',
        }}
      >
        <Messages thread={thread} />
        <Box sx={{ height: (theme) => theme.spacing(2) }} />
        <Input {...inputProps} />
        <ThreadInfo splice={splice} />
      </Stack>
      {stateboard && (
        <Paper elevation={6} sx={{ height: '100%', flexGrow: 1 }}>
          <Stateboard widgets={['FILE_EXPLORER']} />
        </Paper>
      )}
    </Box>
  )
}

export default ThreeBox
