import type { Meta, StoryObj } from '@storybook/react'
import Input from './Input.tsx'
import Provider from './MockProvider.tsx'
import Session from './Session.tsx'
import Debug from 'debug'

const meta: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
  render: (args) => {
    Debug.enable('AI:Input')
    return (
      <Provider>
        <Session repo='dreamcatcher-tech/HAL'>
          <Input {...args} />
        </Session>
      </Provider>
    )
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Blank: Story = {}
export const Preload: Story = {
  args: { preload: 'Hello' },
}
export const Presubmit: Story = {
  args: { preload: 'Add a customer to the CRM', presubmit: true },
}
