import { createContext } from 'react'
import { useNewSession, useRepo } from '../react/hooks.ts'
import Debug from 'debug'
export type SessionProps = { repo: string; children: React.ReactNode }

const log = Debug('AI:Session')

export default function Session(props: SessionProps) {
  const repo = useRepo(props.repo)
  log('repo', repo)
  const session = useNewSession(repo.pid)
  log('session', session)

  if (session.pid === undefined) {
    return (
      <div>
        Loading...
        <pre>REPO: {JSON.stringify(repo, null, 2)}</pre>
        <pre>SESSION: {JSON.stringify(session, null, 2)}</pre>
      </div>
    )
  }
  return (
    <SessionContext.Provider value={{ session }}>
      {props.children}
    </SessionContext.Provider>
  )
}
import type { Session } from '../react/hooks.ts'

interface ContextType {
  session: Session
}
export const SessionContext = createContext<ContextType>({
  session: {},
})
