import type { Meta, StoryObj } from '@storybook/react'
import Container from './Container.tsx'
import { shortBackchat, splice, shortThread, longThread } from '../data.ts'
import { ThreeBoxProps } from './ThreeBox.tsx'
const deferred: ThreeBoxProps = {
  thread: shortThread,
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
    deferred,
    backchat: { ...deferred, thread: shortBackchat },
  },
}
export default meta

export const Basic: Story = {}
export const Deferred: Story = {
  args: {
    deferred: deferred,
    backchat: {
      thread: longThread,
      splice,
    },
    showDeferred: true,
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
