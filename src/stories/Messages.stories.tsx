import {
  longThread,
  mermaidThread,
  mermaidErrorThread,
  testThread,
  filesStateboard,
  router,
  parallelToolCalls,
} from '../data.ts'
import type { Meta, StoryObj } from '@storybook/react'
import Messages from './Messages'
import { useEffect, useState } from 'react'
import Debug from 'debug'
import { Box } from '@mui/material'
import { Container, Left } from './Glass.tsx'

const meta: Meta<typeof Messages> = {
  title: 'Messages',
  component: Messages,
  args: { thread: longThread },
}
export default meta
type Story = StoryObj<typeof Messages>

export const Chat: Story = {}

export const AutoScroll: Story = {
  args: { thread: longThread },
  render: (args) => {
    Debug.enable('AI:Messages')
    const [thread, setThread] = useState(args.thread || longThread)
    useEffect(() => {
      // start a timer, and every 800ms, add a new message to the thread
      let counter = 0
      const id = setInterval(() => {
        const index = counter++ % longThread.messages.length
        const message = longThread.messages[index]
        setThread((prev) => {
          if (prev.messages.length > 50) {
            return longThread
          }
          return { ...prev, messages: [...prev.messages, message] }
        })
      }, 800)
      return () => clearInterval(id)
    }, [])

    return (
      <Box sx={{ height: '90vh' }}>
        <Container>
          <Left>
            <Messages thread={thread} />
          </Left>
        </Container>
      </Box>
    )
  },
}

export const Router: Story = {
  args: { thread: router },
}
export const ParallelToolCalls: Story = {
  args: { thread: parallelToolCalls },
}
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
