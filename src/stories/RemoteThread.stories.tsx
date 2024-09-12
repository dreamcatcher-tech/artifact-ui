import type { Meta, StoryObj } from '@storybook/react'
import RemoteThread from './RemoteThread.tsx'
import { splice, longThread } from '../data.ts'

type Story = StoryObj<typeof RemoteThread>

const meta: Meta<typeof RemoteThread> = {
  title: 'Remote Thread',
  component: RemoteThread,
  args: {
    thread: longThread,
    splice,
    remote: undefined,
    prompt: async () => {},
    transcribe: async () => '',
  },
}
export default meta

export const Chat: Story = {}
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
