import type { Meta, StoryObj } from '@storybook/react'
import ThreeBox from './ThreeBox.tsx'
import {
  filesStateboard,
  splice,
  longThread,
  shortThread,
  blankThread,
} from '../data.ts'

const meta: Meta<typeof ThreeBox> = {
  title: 'ThreeBox',
  component: ThreeBox,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    thread: blankThread,
    splice,
    inputProps: {
      prompt: async (text: string) => {
        console.log('prompt', text)
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof ThreeBox>

export const Basic: Story = {}
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
    stateboard: true,
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
export const Preload: Story = {
  args: {
    inputProps: {
      preload:
        'Update HAL to the latest version by using the engage-help function with "hal-system" as the help name and "Update HAL" as the prompt.  Dont ask me any questions, just do it using your best guess.',
      prompt: async (text: string) => {
        console.log('prompt', text)
      },
    },
  },
}

// Show stateboard in a remote thread
