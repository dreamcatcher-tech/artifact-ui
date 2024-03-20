import { Typography } from '@mui/material'
import { useLatestCommit } from '../react/hooks'
import { FC, useEffect, useState } from 'react'
import { PID, CommitObject } from '../api/web-client.types'

interface Info {
  commit: CommitObject
  oid: string
}
const Info: FC<Info> = ({ commit, oid }) => {
  const { committer, message } = commit
  const { name, timestamp } = committer

  const [secondsElapsed, setSecondsElapsed] = useState(0)

  useEffect(() => {
    const date = new Date(timestamp * 1000)
    const updateElapsedTime = () => {
      const now = Date.now()
      const elapsedSeconds = Math.floor((now - date.getTime()) / 1000)
      setSecondsElapsed(elapsedSeconds)
    }
    const interval = setInterval(updateElapsedTime, 1000)
    return () => clearInterval(interval)
  }, [timestamp])
  // TODO show dirty status of the repo, actions pending, etc
  const since = `${formatElapsedTime(secondsElapsed)}`
  return (
    <>
      <Typography mt={1} variant='caption' component='span'>
        <i>commit:</i>
        <b>{oid.slice(0, 8)}</b> <i>by:</i> {name} <i>message:</i>
        {message} <i>when:</i>
        {since}
      </Typography>
    </>
  )
}

interface Git {
  pid: PID
}
const Git: FC<Git> = ({ pid }) => {
  const splice = useLatestCommit(pid)
  if (!splice) {
    return (
      <Typography mt={1} variant='caption'>
        loading...
      </Typography>
    )
  }
  const { commit, oid } = splice
  return <Info commit={commit} oid={oid} />
}
export default Git

function formatElapsedTime(secondsElapsed: number) {
  const days = Math.floor(secondsElapsed / 86400)
  const hours = Math.floor(secondsElapsed / 3600)
  const minutes = Math.floor((secondsElapsed % 3600) / 60)
  const seconds = secondsElapsed % 60

  let formattedString = ''

  if (days > 0) {
    formattedString += `${days} day${days > 1 ? 's' : ''}, `
  }
  if (hours > 0) {
    formattedString += `${hours} hr${hours > 1 ? 's' : ''}, `
  }
  if (minutes > 0) {
    formattedString += `${minutes} min${minutes > 1 ? 's' : ''}, `
  }
  formattedString += `${seconds} sec${seconds > 1 ? 's' : ''} ago`

  return formattedString
}
