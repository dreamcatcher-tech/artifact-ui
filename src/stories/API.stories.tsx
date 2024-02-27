import '../examples/button.css'
import MockAPI from './MockAPI'
import API from '../api.ts'
import type { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/testing-library'
import Debug from 'debug'
import { useCallback, useState } from 'react'
import { usePing } from '../react/hooks.ts'
const log = Debug('AI:API')

const url = 'https://healthy-seal-74.deno.dev'

const PingButton = () => {
  const ping = usePing()
  const [latency, setLatency] = useState(0)

  const onClick = useCallback(async () => {
    log('ping')
    const start = Date.now()
    await ping()
    setLatency(Date.now() - start)
    log('done')
  }, [])

  return (
    <>
      <button
        type='button'
        className={[
          'storybook-button',
          `storybook-button--large`,
          'storybook-button--primary',
        ].join(' ')}
        style={{ backgroundColor: 'red' }}
        onClick={onClick}
      >
        Ping {url}
      </button>
      <p>ms latency: {latency || '(not started)'}</p>
    </>
  )
}
const APIHarness = () => {
  Debug.enable('*')
  return (
    <MockAPI url={url}>
      <div>
        <h1>API</h1>
        <p>url: {url}</p>
        <p>import.meta.env.VITE_API_URL: {import.meta.env.VITE_API_URL}</p>
      </div>
      <PingButton />
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
    const api = new API(url)
    // const { hostname } = globalThis.location
    // const api = new API(`http://${hostname}:8000`)
    await step('ping ' + url, async () => {
      log('ping')
      await api.ping()
      log('done')
    })
  },
}
