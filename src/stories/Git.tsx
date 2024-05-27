import remarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'
import { useArtifact, useArtifactString, useLatestCommit } from '../react/hooks'
import { FC, useCallback, useEffect, useState } from 'react'
import { PID, CommitObject } from '../api/web-client.types'
import Chip from '@mui/material/Chip'

// when hover over the help, shows the help to you
// at the top of the messages, should have a snippet that shows the sysprompt ?
interface Display {
  commit: CommitObject
  oid: string
  helpName?: string
  help?: string
}
const Display: FC<Display> = ({ commit, oid, helpName, help }) => {
  const {
    committer: { timestamp },
  } = commit

  const [secondsElapsed, setSecondsElapsed] = useState(0)

  useEffect(() => {
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
  const label = helpName ? helpName : <i>'loading...'</i>
  const path = helpName && `helps/${helpName}.md`
  const [open, setOpen] = useState(false)
  const openDialog = useCallback(() => setOpen(true), [setOpen])
  const onClick = help ? openDialog : undefined

  return (
    <Stack direction='row' spacing={1} padding={1} alignItems='center'>
      <Chip label={label} color='warning' size='small' onClick={onClick} />
      <Typography mt={1} variant='caption' component='span'>
        <i>commit: </i>
        <b>{oid.slice(0, 8)} </b>
        <i>when:</i> {since}
      </Typography>
      <Dialog open={open} onClose={() => setOpen(false)} scroll='paper'>
        <DialogTitle>
          Help: <b>{path}</b>
        </DialogTitle>
        <DialogContent dividers>
          <Markdown remarkPlugins={[remarkGfm]}>{help || ''}</Markdown>
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

type EntryHelpFile = {
  help: string
}
interface HALInfo {
  pid: PID | undefined
}
const HALInfo: FC<HALInfo> = ({ pid }) => {
  const splice = useLatestCommit(pid)
  const entry = useArtifact<EntryHelpFile>('entry.json', pid)
  const path = entry?.help && `helps/${entry.help}.md`
  const help = useArtifactString(path, pid)
  let helpName
  if (entry) {
    helpName = entry.help
  }
  if (!splice) {
    return (
      <Typography mt={1} variant='caption'>
        loading...
      </Typography>
    )
  }
  const { commit, oid } = splice
  return <Display commit={commit} oid={oid} helpName={helpName} help={help} />
}
export default HALInfo

function formatElapsedTime(secondsElapsed: number) {
  const days = Math.floor(secondsElapsed / 86400)
  const hours = Math.floor(secondsElapsed / 3600)
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
