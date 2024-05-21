import type { Meta, StoryObj } from '@storybook/react'
import ThreeBox from './ThreeBox.tsx'
import Provider from '../react/Provider.tsx'
import Debug from 'debug'

const meta: Meta<typeof ThreeBox> = {
  title: 'ThreeBox',
  component: ThreeBox,
  render: (args) => {
    Debug.enable('AI:hooks AI:trigger-fs AI:Provider AI:ThreeBox AI:artifact')

    return (
      <Provider>
        <ThreeBox {...args} />
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
