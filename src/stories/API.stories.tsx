// but how would this work in chromatic ?
// import.meta.env.VITE_API_URL

import MockAPI from './MockAPI'
import API from '../api.ts'
import type { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/testing-library'
import Debug from 'debug'
const log = Debug('AI:API')

const APIHarness = () => {
  Debug.enable('*')
  return (
    <MockAPI>
      <div>
        <h1>API</h1>
        <p>API URL: {import.meta.env.VITE_API_URL}</p>
      </div>
    </MockAPI>
  )
}

const meta: Meta<typeof APIHarness> = {
  title: 'API',
  component: APIHarness,
}

export default meta

type Story = StoryObj<typeof APIHarness>

export const Harness: Story = {
  play: async ({ canvasElement, step }) => {
    within(canvasElement)
    const api = new API(`https://healthy-seal-74.deno.dev`)
    // const { hostname } = globalThis.location
    // const api = new API(`http://${hostname}:8000`)
    await step('ping', async () => {
      log('ping')
      await api.ping()
      log('done')
    })
  },
}
