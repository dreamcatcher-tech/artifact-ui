import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { CommitObject, Splice } from '../api/types.ts'
import Chip from '@mui/material/Chip'

interface Display {
  commit?: CommitObject
  oid?: string
  repo?: string
  branches?: string[]
}
const Display: FC<Display> = ({ commit, oid, repo, branches }) => {
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
  const repoLabel = repo ? repo : <i>loading...</i>
  const branchLabel = branches ? prettyBranches(branches) : <i>loading...</i>
  return (
    <Stack direction='row' spacing={1} padding={1} alignItems='center'>
      <Chip
        clickable={true}
        onClick={() => window.open(`https://github.com/${repo}`)}
        label={repoLabel}
        color='warning'
        size='small'
        title={'Github Repository: ' + repo}
      />
      <Chip
        clickable={false}
        label={branchLabel}
        color='info'
        size='small'
        title={'Git Branches: ' + branches?.join('/')}
      />
      <Typography mt={1} variant='caption' component='span'>
        {!commit || !oid ? (
          'loading commit...'
        ) : (
          <>
            <i>commit: </i>
            <b>{oid.slice(0, 8)} </b>
            <i>when:</i> {since}
          </>
        )}
      </Typography>
    </Stack>
  )
}

interface ThreadInfo {
  splice?: Splice
}
const ThreadInfo: FC<ThreadInfo> = ({ splice }) => {
  if (!splice) {
    return (
      <Typography mt={1} variant='caption'>
        loading...
      </Typography>
    )
  }
  const { commit, oid, pid } = splice
  const repo = pid ? `${pid.account}/${pid.repository}` : undefined
  return (
    <Display commit={commit} oid={oid} repo={repo} branches={pid.branches} />
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
const prettyBranches = (branches: string[]) =>
  branches.map((b) => b.substring(0, 7)).join('/')
