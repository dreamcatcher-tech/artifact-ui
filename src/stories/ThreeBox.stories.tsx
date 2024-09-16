import type { Meta, StoryObj } from '@storybook/react'
import ThreeBox from './ThreeBox.tsx'
import {
  filesStateboard,
  splice,
  longThread,
  shortThread,
  blankThread,
} from '../data.ts'
import { Box } from '@mui/material'

const meta: Meta<typeof ThreeBox> = {
  title: 'ThreeBox',
  component: ThreeBox,
  parameters: {
    layout: 'fullscreen',
  },
  render: (args) => (
    <Box sx={{ height: '100vh' }}>
      <ThreeBox {...args} />
    </Box>
  ),
  args: {
    thread: blankThread,
    splice,
    prompt: async (text: string) => {
      console.log('prompt', text)
    },
  },
}
export default meta

type Story = StoryObj<typeof ThreeBox>

export const Basic: Story = {}
export const Loading: Story = {
  args: { splice: undefined },
}
export const Remote: Story = {
  args: {
    remote: { thread: longThread, splice },
  },
}
export const Short: Story = {
  args: {
    thread: shortThread,
    splice,
  },
}
export const FilesStateboard: Story = {
  args: {
    thread: filesStateboard,
    splice,
  },
}

export const Long: Story = {
  args: {
    thread: longThread,
  },
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
