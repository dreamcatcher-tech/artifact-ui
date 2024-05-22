import '../examples/button.css'
import { WebClientEngine } from '../api/web-client-engine.ts'
import Provider from '../react/Provider.tsx'
import type { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/test'
import Debug from 'debug'
import { useCallback, useState } from 'react'
import { usePing, useTerminal } from '../react/hooks.ts'
import { Machine } from '../api/web-client-machine.ts'
import { print } from '../api/web-client.types.ts'

const log = Debug('AI:API')

const url = import.meta.env.VITE_API_URL

const PingButton = () => {
  const session = useTerminal()
  log('session', session)
  log('session %s', print(session.pid))
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
    <Provider>
      <div>
        <h1>API</h1>
        <p>url: {url}</p>
        <p>import.meta.env.VITE_API_URL: {import.meta.env.VITE_API_URL}</p>
      </div>
      <PingButton />
    </Provider>
  )
}

const meta: Meta<typeof APIHarness> = {
  title: 'API',
  component: APIHarness,
}

export default meta

type Story = StoryObj<typeof APIHarness>
Debug.enable('AI:*')

export const Harness: Story = {
  play: async ({ canvasElement, step }) => {
    log('play')
    within(canvasElement)
    const engine = await WebClientEngine.start(url)
    const machine = Machine.load(engine, Machine.generatePrivateKey())
    log('machineId %s', print(machine.pid))
    const terminal = machine.openTerminal()
    await step('ping ' + url, async () => {
      log('ping')
      const result = await terminal.ping()
      log('done', result)
    })
    const repo = 'dreamcatcher-tech/HAL'
    await step(`remove ${repo}`, async () => {
      log('remove')
      const result = await terminal.rm({ repo })
      log('done', result)
    })
    await step(`clone ${url} with ${repo}`, async () => {
      log('clone')
      const result = await terminal.clone({ repo })
      log('done', result)
    })
  },
}
