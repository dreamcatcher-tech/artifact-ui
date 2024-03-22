import type { Meta, StoryObj } from '@storybook/react'
import Session from './Session.tsx'
import ThreeBox from './ThreeBox.tsx'
import { Provider } from './MockProvider.tsx'
import Debug from 'debug'

const meta: Meta<typeof ThreeBox> = {
  title: 'ThreeBox',
  component: ThreeBox,
  render: (args) => {
    Debug.enable('AI:hooks AI:trigger-fs AI:Provider AI:ThreeBox AI:artifact')

    return (
      <Provider>
        <Session repo='dreamcatcher-tech/HAL'>
          <ThreeBox {...args} />
        </Session>
      </Provider>
    )
  },
}
export default meta

type Story = StoryObj<typeof ThreeBox>

export const Blank: Story = {}
export const Preload: Story = {
  args: { preload: 'Hello' },
}
export const Presubmit: Story = {
  args: { preload: 'Hello', presubmit: true },
}
