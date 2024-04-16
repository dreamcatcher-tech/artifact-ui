import '../examples/button.css'
import MockAPI from './MockProvider.tsx'
import { Shell } from '../api/web-client.ts'
import { WebClientEngine } from '../api/web-client-engine.ts'
import type { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/test'
import Debug from 'debug'
import { useCallback, useState } from 'react'
import { usePing } from '../react/hooks.ts'
import { SUPERUSER, pidFromRepo } from '../constants.ts'
const log = Debug('AI:API')

const url = import.meta.env.VITE_API_URL

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
    const engine = WebClientEngine.create(url)

    const shell = Shell.create(engine, SUPERUSER)
    await step('ping ' + url, async () => {
      log('ping')
      const result = await shell.ping()
      log('done', result)
    })
    await step('probe ' + url, async () => {
      log('probe')
      const pid = pidFromRepo(SUPERUSER.id, 'dreamcatcher-tech/HAL')
      const result = await shell.probe({ pid })
      log('done', result)
    })
  },
}
