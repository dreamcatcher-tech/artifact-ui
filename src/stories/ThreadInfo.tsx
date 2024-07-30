import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { CommitObject, Splice } from '../api/web-client.types'
import Chip from '@mui/material/Chip'

interface Display {
  commit?: CommitObject
  oid?: string
  repo?: string
  threadId?: string
}
const Display: FC<Display> = ({ threadId, commit, oid, repo }) => {
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
  const label = repo ? repo : <i>loading...</i>

  return (
    <Stack direction='row' spacing={1} padding={1} alignItems='center'>
      <Chip clickable={false} label={label} color='warning' size='small' />
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
    </Stack>
  )
}

interface ThreadInfo {
  threadId?: string
  splice?: Splice
}
const ThreadInfo: FC<ThreadInfo> = ({ threadId, splice }) => {
  if (!threadId) {
    return (
      <Typography mt={1} variant='caption'>
        loading...
      </Typography>
    )
  }
  const { commit, oid, pid } = splice || {}
  const repo = pid ? `${pid.account}/${pid.repository}` : undefined
  return (
    <Display threadId={threadId || ''} commit={commit} oid={oid} repo={repo} />
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
