import { CommitGraph } from '@dreamcatcher-tech/commit-graph'
import { FC } from 'react'
import { WidgetProps } from '../stories/Stateboard.tsx'
import Debug from 'debug'
import { Splice } from '../constants.ts'
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

  const splices = api.useCommits()
  const commits = mapSplices(splices)
  // const commits = threeBranches
  log('commits', commits)

  // when click on one, want to set the commit in the api, and watch the files
  // change below it

  // when select the parent commit, then all the child branches with their
  // respective heads should be shown, but not before

  const branchHeads = [
    {
      name: 'main',
      commit: {
        sha: 'bgpqkjvf2mqoi9lq4upamdj0ke7e8iuo',
      },
    },
    {
      name: 'feature-branch',
      commit: {
        sha: 'bgpv9t0smfear03um03737mrkggb84o2',
      },
    },
    {
      name: 'another-branch',
      commit: {
        sha: 'r26g8v5vo7c82c5o1tt9hcleef924tp2',
      },
    },
  ]
  const selected = [
    'bgpqkjvf2mqoi9lq4upamdj0ke7e8iuo',
    'r26g8v5vo7c82c5o1tt9hcleef924tp2',
  ]
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

  return (
    <CommitGraph
      commits={commits}
      branchHeads={branchHeads}
      graphStyle={graphStyle}
      onClick={(commit, event) => {
        console.log('onClick', commit, event)
      }}
      selected={selected}
    />
  )
}

export default ArtifactCommitGraph

const mapSplices = (splices: Splice[]) => {
  return splices.map((splice) => {
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
}
