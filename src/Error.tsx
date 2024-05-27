import { useEffect, type FC } from 'react'

import ansiHTML from 'ansi-html'

interface FallbackRender {
  error: Error
}
export const FallbackRender: FC<FallbackRender> = ({ error }) => {
  useEffect(() => {
    console.error(error)
  }, [error])
  return (
    <div role='alert'>
      <p>Something went wong:</p>
      <pre style={{ color: 'red' }}>{error.name}</pre>
      <pre style={{ color: 'red' }}>{ansiHTML(error.message)}</pre>
      <pre style={{ color: 'red' }}>{error.stack}</pre>
    </div>
  )
}
