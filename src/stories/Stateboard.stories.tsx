import Debug from 'debug'
import type { Meta, StoryObj } from '@storybook/react'
import Stateboard from './Stateboard.tsx'
import ArtifactProvider from '../react/ArtifactProvider.tsx'
import { Box } from '@mui/material'

const meta: Meta<typeof Stateboard> = {
  title: 'Stateboard',
  component: Stateboard,
  args: { widgets: ['FILE_EXPLORER'] },
}
export default meta

type Story = StoryObj<typeof Stateboard>

export const Empty: Story = {}
//   'TPS_REPORT',
//   'FILES',
//   'BRANCH_EXPLORER',
//   'COMMIT_GRAPH',
//   'COMMIT_INFO',
//   'THREADS',
//   'REPOS',
export const Files: Story = {}
export const FilesWithApi: Story = {
  render: (args) => {
    Debug.enable('AI:Stateboard AI:FileExplorer')
    return (
      <ArtifactProvider>
        <Box sx={{ height: '90vh' }}>
          <Stateboard {...args} />
        </Box>
      </ArtifactProvider>
    )
  },
}
export const CommitsWithApi: Story = {
  render: (args) => {
    Debug.enable('AI:Stateboard AI:ArtifactCommitGraph')
    return (
      <ArtifactProvider>
        <Box sx={{ height: '90vh' }}>
          <Stateboard {...args} />
        </Box>
      </ArtifactProvider>
    )
  },
  args: { widgets: ['COMMIT_GRAPH'] },
}
export const EditorWithApi: Story = {
  render: (args) => {
    Debug.enable('AI:Stateboard AI:Editor')
    return (
      <ArtifactProvider>
        <Box sx={{ height: '90vh' }}>
          <Stateboard {...args} />
        </Box>
      </ArtifactProvider>
    )
  },
  args: { widgets: ['MARKDOWN_EDITOR'] },
}
export const Party: Story = {
  render: (args) => {
    Debug.enable(
      'AI:Stateboard AI:Editor AI:FileExplorer AI:ArtifactCommitGraph'
    )
    return (
      <ArtifactProvider>
        <Box sx={{ height: '90vh' }}>
          <Stateboard {...args} />
        </Box>
      </ArtifactProvider>
    )
  },
  args: { widgets: ['COMMIT_GRAPH', 'FILE_EXPLORER', 'MARKDOWN_EDITOR'] },
}
export const Short: Story = {
  args: {},
}

export const Narrow: Story = {
  parameters: {
    viewport: {
      viewports: {
        narrow: {
          name: 'Narrow',
          styles: {
            width: '400px',
            height: '100%',
          },
        },
      },
      defaultViewport: 'narrow',
    },
  },
}
