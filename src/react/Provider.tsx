import { createContext, FC, useState, useEffect } from 'react'
import { WebClientEngine } from '../api/web-client-engine.ts'
import { Machine } from '../api/web-client-machine.ts'
import {
  ArtifactSession,
  PID,
  freezePid,
  isValidForMachine,
  print,
} from '../api/web-client.types.ts'
import { assertNull } from '@sindresorhus/is'
import Debug from 'debug'
const log = Debug('AI:Provider')

interface ContextType {
  session: ArtifactSession
}
export const ArtifactContext = createContext<ContextType>({
  session: {} as ArtifactSession,
})
interface Props {
  children: React.ReactNode
  url?: string
}

const Provider: FC<Props> = ({ children, url }) => {
  url = url || import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error('API URL not set')
  }
  const [session, setSession] = useState<ArtifactSession>()
  const [error, setError] = useState<Error>()

  useEffect(() => {
    let active = true
    let toStop: ArtifactSession
    WebClientEngine.start(url)
      .then((engine) => {
        log('engine home: %s', print(engine.homeAddress))
        if (!active) {
          return
        }
        const privateKey = recoverPrivateKey()
        const machine = Machine.load(engine, privateKey)
        log('machine PID: %s', print(machine.pid))

        const retry = maybeExistingSession(machine.pid)
        let session
        try {
          session = machine.openSession(retry)
        } catch (error) {
          console.error('error opening session %s', error)
          session = machine.openSession()
        }
        sessionStorage.setItem('session', JSON.stringify(session.pid, null, 2))
        setSession(session)
        toStop = session
      })
      .catch((error) => active && setError(error))
    return () => {
      active = false
      setSession(undefined)
      if (toStop) {
        toStop.engineStop()
        log('shutdown machine: %s', print(toStop.machine.pid))
      } else {
        log('shutdown machine: none')
      }
    }
  }, [url])
  if (error) {
    throw error
  }

  if (!session) {
    return <div>Loading... </div>
  }
  // TODO do home chain negotiations, then auth login
  return (
    <ArtifactContext.Provider value={{ session }}>
      {children}
    </ArtifactContext.Provider>
  )
}

const maybeExistingSession = (machinePid: PID) => {
  try {
    const existing = sessionStorage.getItem('session')
    if (!existing) {
      return
    }
    const session = JSON.parse(existing)
    if (!isValidForMachine(session, machinePid)) {
      throw new Error('Invalid session pid: ' + print(session))
    }
    freezePid(session)
    return session
  } catch (error) {
    console.error('error restoring session', error)
    sessionStorage.removeItem('session')
  }
}

const recoverPrivateKey = () => {
  let privateKey = localStorage.getItem('privateKey')
  if (!privateKey) {
    log('generating new private key')
    privateKey = Machine.generatePrivateKey()
    assertNull(localStorage.getItem('privateKey'), 'privateKey race')
    localStorage.setItem('privateKey', privateKey)
  } else {
    log('recovered private key')
  }
  return privateKey
}

export default Provider
