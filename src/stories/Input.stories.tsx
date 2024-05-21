import type { Meta, StoryObj } from '@storybook/react'
import Input from './Input.tsx'
import Provider from '../react/Provider.tsx'
import Debug from 'debug'

const meta: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
  render: (args) => {
    Debug.enable('AI:Input')
    return (
      <Provider>
        <Input {...args} />
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
