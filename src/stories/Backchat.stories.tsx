import type { Meta, StoryObj } from '@storybook/react'
import BackchatDialog from './Backchat.tsx'
import { splice, longThread } from './data.ts'
import { useEffect, useState } from 'react'

type Story = StoryObj<typeof BackchatDialog>

const meta: Meta<typeof BackchatDialog> = {
  title: 'Backchat',
  component: BackchatDialog,
  args: { open: true },
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
export const Long: Story = {
  args: { thread: longThread },
}
export const Slideshow: Story = {
  render: () => {
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
      <BackchatDialog
        handleClose={() => setOpen(false)}
        open={open}
        thread={longThread}
        threadId='123'
        splice={splice}
      />
    )
  },
}
