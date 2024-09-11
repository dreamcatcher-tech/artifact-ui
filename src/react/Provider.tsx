import { createContext, FC, useState, useEffect } from 'react'
import { Crypto } from '../api/crypto.ts'
import { WebClientEngine } from '../api/client-engine.ts'
import { Backchat } from '../api/client-backchat.ts'
import { print, EngineInterface, backchatIdRegex } from '../api/types.ts'
import { assert } from '@sindresorhus/is'
import Debug from 'debug'
const log = Debug('AI:Provider')

interface ContextType {
  backchat: Backchat
}
export const ArtifactContext = createContext<ContextType>({
  backchat: {} as Backchat,
})
interface Props {
  children: React.ReactNode
  url?: string
}
enum Status {
  EngineStarting = 'Starting Web Engine...',
  LoadingBackchat = 'Loading Backchat...',
  Showtime = 'Backchat Loaded - showtime starting...',
}
const Provider: FC<Props> = ({ children, url }) => {
  url = url || import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error('API URL not set')
  }
  const [backchat, setBackchat] = useState<Backchat>()
  const [error, setError] = useState<Error>()
  const [status, setStatus] = useState<Status>(Status.EngineStarting)

  useEffect(() => {
    let active = true
    let toStop: EngineInterface
    WebClientEngine.start(url)
      .then((engine) => {
        if (!active) {
          return
        }
        setStatus(Status.LoadingBackchat)
        log('engine home: %s', print(engine.homeAddress))
        toStop = engine

        const key = recoverPrivateKey()
        const resume = recoverBackchatId()
        return Backchat.upsert(engine, key, resume)
      })
      .then((backchat) => {
        if (!active) {
          return
        }
        if (!backchat) {
          throw new Error('backchat not created')
        }
        setStatus(Status.Showtime)
        log('backchat: %s', print(backchat.pid))
        setBackchat(backchat)
        sessionStorage.setItem('backchatId', backchat.id)
      })
      .catch((error) => active && setError(error))
    return () => {
      active = false
      setBackchat(undefined)
      if (toStop) {
        toStop.stop()
        log('shutdown engine')
      }
    }
  }, [url])
  if (error) {
    throw error
  }

  if (!backchat) {
    return <div>{status}</div>
  }
  // TODO do crypto negotiations, then auth login
  return (
    <ArtifactContext.Provider value={{ backchat }}>
      {children}
    </ArtifactContext.Provider>
  )
}

const recoverBackchatId = () => {
  try {
    const existing = sessionStorage.getItem('backchatId')
    if (existing) {
      if (backchatIdRegex.test(existing)) {
        console.log('recovered backchat id:', existing)
        return existing
      }
    }
  } catch (error) {
    console.error('recoverBackchatId', error)
  }
  sessionStorage.removeItem('backchatId')
}

const recoverPrivateKey = () => {
  let privateKey = localStorage.getItem('privateKey')
  if (!privateKey) {
    log('generating new private key')
    privateKey = Crypto.generatePrivateKey()
    assert.falsy(localStorage.getItem('privateKey'), 'privateKey race')
    localStorage.setItem('privateKey', privateKey)
  } else {
    console.log('recovered private key')
  }
  return privateKey
}

export default Provider
