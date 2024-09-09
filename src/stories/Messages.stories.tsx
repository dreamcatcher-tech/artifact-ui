import {
  longThread,
  mermaidThread,
  mermaidErrorThread,
  testThread,
  filesStateboard,
} from '../data.ts'
import type { Meta, StoryObj } from '@storybook/react'
import Messages from './Messages'

const meta: Meta<typeof Messages> = {
  title: 'Messages',
  component: Messages,
  args: { thread: longThread },
}
export default meta
type Story = StoryObj<typeof Messages>

export const Chat: Story = {}
export const Test: Story = {
  args: { thread: testThread },
}
export const FilesStateboard: Story = {
  args: {
    thread: filesStateboard,
  },
}
export const Mermaid: Story = { args: { thread: mermaidThread } }

export const MermaidError: Story = { args: { thread: mermaidErrorThread } }
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
