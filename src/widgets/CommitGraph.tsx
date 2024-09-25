import { WithInfiniteScroll } from '@dreamcatcher-tech/commit-graph'
import { FC, useId } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'
import Debug from 'debug'
import { Splice } from '../constants.ts'
import Box from '@mui/material/Box'
const log = Debug('AI:ArtifactCommitGraph')

const ArtifactCommitGraph: FC<WidgetProps> = ({ api }) => {
  log('ArtifactCommitGraph', api)

  // the api has a target / scoped PID

  // read pid
  // set pid
  // loads of the pid, up to some limit
  // watch so the tip is always up to date
  // plug the holes in the graph between last known version, so ask for logs
  // using time and then dedupe

  const splices = api.useSplices()
  const { commits, branchHeads } = mapSplices(splices)
  log('commits', commits)
  let hasMore = false
  if (splices && splices.length) {
    hasMore = splices[splices.length - 1].commit.parent.length > 0
  }

  // when click on one, want to set the commit in the api, and watch the files
  // change below it

  // when select the parent commit, then all the child branches with their
  // respective heads should be shown, but not before

  let selected: string[] = []
  if (commits.length) {
    selected = [commits[0].sha]
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
  const id = useId()
  return (
    <Box
      id={id}
      // must reset the zIndex so the mouse over and select works
      sx={{ pt: 2, pl: 2, height: '100%', position: 'relative', zIndex: 0 }}
    >
      <WithInfiniteScroll
        parentID={id}
        commits={commits}
        branchHeads={branchHeads}
        graphStyle={graphStyle}
        onClick={(commit, event) => {
          console.log('onClick', commit, event)
        }}
        hasMore={hasMore}
        loadMore={() => {
          log('loadMore')
          api.expandCommits(10)
        }}
        selected={selected}
      />
    </Box>
  )
}

export default ArtifactCommitGraph

const mapSplices = (splices: Splice[]) => {
  const heads = new Map<string, Splice>()
  const commits = splices.map((splice) => {
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
    return {
      sha: splice.oid,
      commit,
      parents: splice.commit.parent.map((parent) => {
        return { sha: parent }
      }),
    }
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
