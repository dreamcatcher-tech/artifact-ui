import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { CommitObject, Splice } from '../api/types.ts'
import Chip from '@mui/material/Chip'
import { RemoteTree } from '../react/thread-tree-watcher.ts'

interface Chips {
  commit: CommitObject
  oid: string
  repo: string
  branches: string[]
  remote?: RemoteTree
  onRemote?: () => void
}
const Chips: FC<Chips> = ({
  commit,
  oid,
  repo,
  branches,
  remote,
  onRemote,
}) => {
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
  const location = window.location.origin + window.location.pathname
  const repoUrl = `https://github.com/${repo}`
  const branchUrl = `${location}#branches=${branches.join('/')}`
  const branchLabel = prettyBranches(branches)
  const commitUrl = `${branchUrl}&commit=${oid}`
  let remoteLabel = ''
  if (remote) {
    remoteLabel = 'loading...'
    if (remote.splice) {
      remoteLabel = `Show the remote thread: ${remote.splice.pid.branches.join('/')}`
    }
  }
  return (
    <>
      <a href={repoUrl} style={{ textDecoration: 'none' }} onClick={onClick}>
        <Chip
          clickable={true}
          onClick={() => window.open(repoUrl, '_blank', 'noopener')}
          label={repo}
          color='warning'
          size='small'
          title={'Open this repo on github.com'}
        />
      </a>
      <a href={branchUrl} style={{ textDecoration: 'none' }} onClick={onClick}>
        <Chip
          clickable={true}
          label={branchLabel}
          onClick={() => window.open(branchUrl, '_blank', 'noopener')}
          color='info'
          size='small'
          title={'Open this thread remotely'}
        />
      </a>
      {remote && (
        <Chip
          clickable={true}
          onClick={onRemote}
          label='remote'
          color='secondary'
          size='small'
          title={remoteLabel}
        />
      )}
      <Typography
        mt={1}
        variant='caption'
        component='span'
        title='Open this commit remotely'
      >
        <i>commit: </i>
        <a
          href={commitUrl}
          style={{ textDecoration: 'none' }}
          target='_blank'
          rel='noopener'
        >
          <b>{oid.slice(0, 8)} </b>
        </a>
        <i>when:</i> {since}
      </Typography>
    </>
  )
}

interface ThreadInfo {
  splice?: Splice
  remote?: RemoteTree
  onRemote?: () => void
}
const ThreadInfo: FC<ThreadInfo> = ({ splice, remote, onRemote }) => {
  let chips
  if (!splice) {
    chips = (
      <Chip
        clickable={false}
        label={<i>loading...</i>}
        color='info'
        size='small'
      />
    )
  } else {
    const { commit, oid, pid } = splice
    const repo = `${pid.account}/${pid.repository}`
    chips = (
      <Chips
        commit={commit}
        oid={oid}
        repo={repo}
        branches={pid.branches}
        remote={remote}
        onRemote={onRemote}
      />
    )
  }
  return (
    <Stack direction='row' spacing={1} padding={1} alignItems='center'>
      {chips}
    </Stack>
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

const onClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
  event.preventDefault()
}
