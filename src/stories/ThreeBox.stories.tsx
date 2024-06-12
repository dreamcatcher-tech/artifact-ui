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
export const Preload: Story = {
  args: {
    preload:
      'Update HAL to the latest version by using the engage-help function with "hal-system" as the help name and "Update HAL" as the prompt.  Dont ask me any questions, just do it using your best guess.',
  },
}
export const Presubmit: Story = {
  args: {
    preload:
      'Update HAL to the latest version by using the engage-help function with "hal-system" as the help name and "Update HAL" as the prompt.  Dont ask me any questions, just do it using your best guess.',
    presubmit: true,
  },
}
