import type { Meta, StoryObj } from '@storybook/react'
import Input from './Input.tsx'
import delay from 'delay'
import { userEvent, within } from '@storybook/test'
import { assert } from '@sindresorhus/is'

const meta: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
  args: {
    prompt: async (text: string) => {
      console.log('prompt', text)
      await new Promise((resolve) => setTimeout(resolve, 500))
      console.log('prompt done')
    },
    transcribe: async (audio: File) => {
      console.log('transcribe', audio)
      await new Promise((resolve) => setTimeout(resolve, 500))
      return 'Hello'
    },
    handleBackchat: () => {
      console.log('backchat')
    },
  },
}
export default meta

type Story = StoryObj<typeof Input>

export const Loading: Story = {
  args: {
    prompt: undefined,
    transcribe: undefined,
  },
}
export const Ready: Story = {}
export const Attachments: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const attach = canvas.getByLabelText('SpeedDial')
    await userEvent.click(attach)
  },
}
export const NoBackchat: Story = {
  args: { handleBackchat: undefined },
  play: Attachments.play,
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
export const Preload: Story = {
  args: { preload: 'Hello preload' },
}
export const Submit: Story = {
  args: {
    preload: 'Add a customer to the CRM',
    presubmit: true,
    prompt: (text: string) => {
      console.log('prompt', text)
      return new Promise(() => {})
    },
  },
}
export const PostSubmission: Story = {
  args: {
    preload: 'Submit and return',
    presubmit: true,
    prompt: (text: string) => {
      console.log('prompt', text)
      return Promise.resolve()
    },
  },
}
export const SubmitBlankText: Story = {
  args: { preload: '', presubmit: true },
}
export const Recording: Story = {
  args: {
    presubmit: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('transcribe', async () => {
      await delay(1000)
      const mic = canvas.getByTestId('mic')
      await userEvent.click(mic)
    })
  },
}

const context: { trigger?: (value: unknown) => void } = {}

export const Transcribing: Story = {
  args: {
    presubmit: true,
    transcribe: async (audio: File) => {
      await new Promise(() => audio)
      console.log('transcribe done')
      return 'never'
    },
    onRecording: async (isRecording: boolean) => {
      console.log('isRecording', isRecording)
      assert.truthy(context.trigger)
      context.trigger(isRecording)
    },
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const promise = new Promise((resolve) => {
      context.trigger = resolve
    })
    await step('transcribe', async () => {
      await delay(500)
      let mic = canvas.getByTestId('mic')
      await userEvent.click(mic)
      await promise
      await delay(1000)
      mic = canvas.getByTestId('mic')
      await userEvent.click(mic)
    })
  },
}
