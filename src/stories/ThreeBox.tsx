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
        flexDirection: 'row',
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: 'red',
      }}
    >
      <Stack
        direction='column'
        alignItems='flex-start'
        justifyContent='flex-end'
        sx={{
          height: '100%',
          maxWidth: '800px',
          width: '100%',
        }}
      >
        <Box
          sx={{
            mb: 1,
            backgroundColor: 'coral',
            overflowY: 'auto',
          }}
        >
          <Messages thread={thread} />
        </Box>
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
