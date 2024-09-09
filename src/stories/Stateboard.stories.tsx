import type { Meta, StoryObj } from '@storybook/react'
import Stateboard from './Stateboard.tsx'
// import { STATEBOARD_WIDGETS } from '../constants.ts'
// import { splice, longThread, shortThread, blankThread } from '../data.ts'

const meta: Meta<typeof Stateboard> = {
  title: 'Stateboard',
  component: Stateboard,
  args: {
    widgets: ['FILE_EXPLORER'],
  },
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
export const Files: Story = {
  args: {
    widgets: ['FILE_EXPLORER'],
  },
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
