import type { Meta, StoryObj } from '@storybook/react'
import ThreeBox from './ThreeBox.tsx'
import { splice, longThread, shortThread, blankThread } from '../data.ts'

const meta: Meta<typeof ThreeBox> = {
  title: 'ThreeBox',
  component: ThreeBox,
  args: {
    thread: blankThread,
    threadId: 'testThreadId',
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

// stateboard should show underneath the thread, or next to, depending on screen
// size

export const Long: Story = {
  args: {
    thread: longThread,
    threadId: 'testThreadId',
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
