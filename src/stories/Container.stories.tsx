import type { Meta, StoryObj } from '@storybook/react'
import Container from './Container.tsx'
import { shortBackchat, splice, shortThread, longThread } from './data.ts'
import { ThreeBoxProps } from './ThreeBox.tsx'
const focus: ThreeBoxProps = {
  thread: shortThread,
  threadId: 'testThreadId',
  md: '## Short Thread\n\nThis is a short thread.',
  splice,
  inputProps: {
    prompt: async (text: string) => {
      console.log('prompt', text)
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('prompt done')
    },
  },
}
type Story = StoryObj<typeof Container>

const meta: Meta<typeof Container> = {
  title: 'Container',
  component: Container,
  args: {
    focus,
    backchat: { ...focus, thread: shortBackchat },
  },
}
export default meta

export const Basic: Story = {}
const backchatThreadId = 'backchatThreadId'
export const Backchat: Story = {
  args: {
    focus,
    backchat: {
      thread: longThread,
      threadId: backchatThreadId,
      md: '## Long Thread\n\nThis is a long thread.',
      splice,
    },
    showBackchat: true,
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
