import type { Meta, StoryObj } from '@storybook/react'
import RemoteThread from './RemoteThread.tsx'
import { splice, longThread } from '../data.ts'
import { useEffect, useState } from 'react'

type Story = StoryObj<typeof RemoteThread>

const meta: Meta<typeof RemoteThread> = {
  title: 'Remote Thread',
  component: RemoteThread,
  args: { open: true, thread: longThread, splice },
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
export const Long: Story = {}
export const Slideshow: Story = {
  render: ({ thread, splice }) => {
    const [open, setOpen] = useState(true)
    useEffect(() => {
      let state = true
      const interval = setInterval(() => {
        state = !state
        setOpen(state)
      }, 800)
      return () => clearInterval(interval)
    })

    return (
      <RemoteThread
        handleClose={() => setOpen(false)}
        open={open}
        thread={thread}
        splice={splice}
      />
    )
  },
}
