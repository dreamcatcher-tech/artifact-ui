import posix from 'path-browserify'
import remarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'
import { FC, useCallback, useEffect, useState } from 'react'
import { CommitObject, Agent, Splice } from '../api/web-client.types'
import Chip from '@mui/material/Chip'
import { assert } from '@sindresorhus/is'

interface Display {
  commit?: CommitObject
  oid?: string
  agent?: Agent
  md?: string
  threadId?: string
}
const Display: FC<Display> = ({ threadId, commit, oid, agent, md }) => {
  const timestamp = commit?.committer.timestamp
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  useEffect(() => {
    if (!timestamp) {
      return
    }
    const date = new Date(timestamp * 1000)
    const updateElapsedTime = () => {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - date.getTime()) / 1000)
      if (elapsedSeconds < 0) {
        setSecondsElapsed(0)
      } else {
        setSecondsElapsed(elapsedSeconds)
      }
    }
    updateElapsedTime()
    const interval = setInterval(updateElapsedTime, 1000)
    return () => clearInterval(interval)
  }, [timestamp])
  // TODO show dirty status of the repo, actions pending, etc
  const since = `${formatElapsedTime(secondsElapsed)}`
  const label = agent ? getName(agent) : <i>loading...</i>
  const path = agent && agent.source.path
  const [open, setOpen] = useState(false)
  const openDialog = useCallback(() => setOpen(true), [setOpen])
  const onClick = agent && md ? openDialog : undefined

  return (
    <Stack direction='row' spacing={1} padding={1} alignItems='center'>
      <Chip label={label} color='warning' size='small' onClick={onClick} />
      <Typography mt={1} variant='caption' component='span'>
        {!commit || !oid ? (
          'loading commit...'
        ) : (
          <>
            <i>commit: </i>
            <b>{oid.slice(0, 8)} </b>
            <i>thread: </i>
            <b>{threadId?.substring(0, 11)} </b>
            <i>when:</i> {since}
          </>
        )}
      </Typography>

      <Dialog open={open} onClose={() => setOpen(false)} scroll='paper'>
        <DialogTitle>
          Agent: <b>{path}</b>
        </DialogTitle>
        <DialogContent dividers>
          <Markdown remarkPlugins={[remarkGfm]}>{md || ''}</Markdown>
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

interface ThreadInfo {
  threadId?: string
  agent?: Agent
  splice?: Splice
  md?: string
}
const ThreadInfo: FC<ThreadInfo> = ({ threadId, agent, splice, md }) => {
  if (!threadId) {
    return (
      <Typography mt={1} variant='caption'>
        loading...
      </Typography>
    )
  }
  const { commit, oid } = splice || {}
  return (
    <Display
      threadId={threadId || ''}
      commit={commit}
      oid={oid}
      agent={agent}
      md={md}
    />
  )
}
export default ThreadInfo

function formatElapsedTime(secondsElapsed: number) {
  const days = Math.floor(secondsElapsed / 86400)
  const hours = Math.floor((secondsElapsed % 86400) / 3600)
  const minutes = Math.floor((secondsElapsed % 3600) / 60)
  const seconds = secondsElapsed % 60

  let formattedString = ''

  if (days > 0) {
    formattedString += `${days} day${days > 1 ? 's' : ''} `
  }
  if (hours > 0) {
    formattedString += `${hours} hr${hours > 1 ? 's' : ''} `
  }
  if (minutes > 0) {
    formattedString += `${minutes} min${minutes > 1 ? 's' : ''} `
  }
  formattedString += `${seconds} sec${seconds > 1 ? 's' : ''} ago`

  return formattedString
}
const getName = (agent: Agent) => {
  const path = agent.source.path
  assert.truthy(path.endsWith('.md'), 'invalid agent path: ' + path)
  const name = posix.basename(path, '.md')
  return name
}
