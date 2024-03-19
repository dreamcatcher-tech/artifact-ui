import { deserializeError as toError } from 'serialize-error'
import '../examples/button.css'
import { toEvents } from '../react/Provider.tsx'
import MockAPI from './MockProvider.tsx'
import WebClient from '../api/web-client.ts'
import type { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/test'
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
  }, [ping])

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
    const api = new WebClient(url, toError, toEvents)
    await step('ping ' + url, async () => {
      log('ping')
      const result = await api.ping()
      log('done', result)
    })
    await step('probe ' + url, async () => {
      log('probe')
      const result = await api.probe({ repo: 'dreamcatcher-tech/HAL' })
      log('done', result)
    })
  },
}
