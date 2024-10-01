import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { WithInfiniteScroll } from '@dreamcatcher-tech/commit-graph'
import { FC, useId } from 'react'
import { StateboardApi, WidgetProps } from '../stories/Stateboard.tsx'
import Debug from 'debug'
import { PID, Splice } from '../constants.ts'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import Breadcrumbs from '@mui/material/Breadcrumbs'
const log = Debug('AI:ArtifactCommitGraph')

const useBreadcrumbs = (pid: PID | undefined, api: StateboardApi) => {
  if (!pid) {
    return '(loading...)'
  }
  const { branches } = pid
  const accumulator: string[] = []
  const breadcrumbs = branches.map((branch, index) => {
    accumulator.push(branch)
    const path = [...accumulator]
    const onClick = (
      event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
    ) => {
      event.preventDefault()
      const next = { ...pid, branches: path }
      api.setPID(next)
    }
    return (
      <Link
        underline='hover'
        key={index}
        color='inherit'
        href={path.join('/')}
        onClick={onClick}
      >
        {branch}
      </Link>
    )
  })
  return breadcrumbs
}
const graphStyle = {
  commitSpacing: 60,
  branchSpacing: 20,
  nodeRadius: 3,
  branchColors: [
    '#010A40',
    '#FC42C9',
    '#3D91F0',
    '#29E3C1',
    '#C5A15A',
    '#FA7978',
    '#5D6280',
    '#5AC58D',
    '#5C5AC5',
    '#EB7340',
  ],
}

const ArtifactCommitGraph: FC<WidgetProps> = ({ api }) => {
  log('ArtifactCommitGraph', api)

  const splices = api.useSplices()
  const { commits, branchHeads } = mapSplices(splices)
  log('commits', commits)
  let hasMore = true
  if (splices.length) {
    hasMore = splices[splices.length - 1].commit.parent.length > 0
  }

  const selectedSplice = api.useSelectedSplice()
  let selected: string[] = []
  if (selectedSplice) {
    selected = [selectedSplice.oid]
  }
  const pid = api.usePID()
  const breadcrumbs = useBreadcrumbs(pid, api)

  const id = useId()
  return (
    <Stack sx={{ height: '100%', pl: 2 }} spacing={1}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize='small' />}
        aria-label='breadcrumb'
      >
        {breadcrumbs}
      </Breadcrumbs>
      <Box
        id={id}
        // must reset the zIndex so the mouse over and select works
        sx={{
          pt: 1,
          pl: 1,
          height: '100%',
          position: 'relative',
          zIndex: 0,
          overflow: 'auto',
        }}
      >
        <WithInfiniteScroll
          parentID={id}
          commits={commits}
          branchHeads={branchHeads}
          currentBranch={branchHeads[0]?.name}
          graphStyle={graphStyle}
          onClick={(commit, event) => {
            log('onClick', commit, event)
            const splice = splices.find((splice) => splice.oid === commit)
            if (!splice) {
              throw new Error('splice not found: ' + commit)
            }
            api.setSelectedSplice(splice)
          }}
          hasMore={hasMore}
          loadMore={() => api.expandCommits(30)}
          selected={selected}
          dateFormatFn={(date) => new Date(date).toLocaleString()}
        />
      </Box>
    </Stack>
  )
}

export default ArtifactCommitGraph

const mapSplices = (splices: Splice[]) => {
  const heads = new Map<string, Splice>()
  const seen = new Set<string>()
  const commits: Commit[] = []

  splices.forEach((splice) => {
    if (seen.has(splice.oid)) {
      return
    }
    seen.add(splice.oid)

    const path = toPath(splice)
    if (!heads.has(path)) {
      heads.set(path, splice)
    }

    const commit = {
      author: {
        name: splice.commit.author.name,
        date: splice.commit.author.timestamp * 1000,
      },
      message: splice.commit.message,
    }
    commits.push({
      sha: splice.oid,
      commit,
      parents: splice.commit.parent.map((parent) => {
        return { sha: parent }
      }),
      // .reverse(),
    })
  })
  const branchHeads = []
  for (const [path, splice] of heads.entries()) {
    branchHeads.push({
      name: path,
      commit: {
        sha: splice.oid,
      },
    })
  }

  return { commits, branchHeads }
}

const toPath = (splice: Splice) => {
  return splice.pid.branches.map((string) => string.substring(0, 7)).join('/')
}

type ParentCommit = {
  sha: string
}
type Commit = {
  sha: string
  commit: {
    author: {
      name: string
      date: string | number | Date
      email?: string
    }
    message: string
  }
  parents: ParentCommit[]
  html_url?: string
}
