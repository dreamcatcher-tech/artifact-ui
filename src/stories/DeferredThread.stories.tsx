import type { Meta, StoryObj } from '@storybook/react'
import DeferredDialog from './DeferredThread.tsx'
import { splice, longThread } from '../data.ts'
import { useEffect, useState } from 'react'

type Story = StoryObj<typeof DeferredDialog>

const meta: Meta<typeof DeferredDialog> = {
  title: 'Deferred Thread',
  component: DeferredDialog,
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
      <DeferredDialog
        handleClose={() => setOpen(false)}
        open={open}
        thread={thread}
        splice={splice}
      />
    )
  },
}
