import '../examples/button.css'
import { WebClientEngine } from '../api/web-client-engine.ts'
import { Backchat } from '../api/web-client-backchat.ts'
import Provider from '../react/Provider.tsx'
import type { Meta, StoryObj } from '@storybook/react'
import { within } from '@storybook/test'
import Debug from 'debug'
import { useCallback, useState } from 'react'
import { usePing, useBackchat, useBackchatThread } from '../react/hooks.ts'
import { print } from '../api/web-client.types.ts'
import { Crypto } from '../api/web-client-crypto.ts'

const log = Debug('AI:API')

const url = import.meta.env.VITE_API_URL

const PingButton = () => {
  const session = useBackchat()
  log('session', session)
  log('session %s', print(session.pid))
  const ping = usePing()
  const [latency, setLatency] = useState(0)
  const { focusId, ...backchatData } = useBackchatThread()
  log('focusId', focusId)
  log('backchatData', backchatData)

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
    const key = Crypto.generatePrivateKey()
    const backchat = await Backchat.upsert(engine, key)
    await step('ping ' + url, async () => {
      log('ping')
      const result = await backchat.ping()
      log('done', result)
    })
    const repo = 'dreamcatcher-tech/HAL'
    await step(`remove ${repo}`, async () => {
      log('remove')
      const result = await backchat.rm({ repo })
      log('done', result)
    })
    await step(`clone ${url} with ${repo}`, async () => {
      log('clone')
      const result = await backchat.clone({ repo })
      log('done', result)
    })
  },
}

export const BackchatThread: Story = {}
