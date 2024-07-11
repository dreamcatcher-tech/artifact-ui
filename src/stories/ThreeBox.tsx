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
  threadId?: string
  thread?: Thread
  splice?: Splice
  md?: string
  inputProps?: InputProps
  handleBackchat?: () => void
}

const ThreeBox: FC<ThreeBoxProps> = (props) => {
  const { threadId, thread, splice, md, inputProps, handleBackchat } = props
  const messages = thread?.messages || []
  log('messages', messages)
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
        sx={{ minHeight: '100%', maxWidth: '800px', width: '100%' }}
      >
        <Messages thread={thread} />
        <Input {...inputProps} handleBackchat={handleBackchat} />
        <ThreadInfo
          threadId={threadId}
          agent={thread?.agent}
          splice={splice}
          md={md}
        />
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
