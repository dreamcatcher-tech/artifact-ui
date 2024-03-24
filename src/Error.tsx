import type { FC } from 'react'

interface FallbackRender {
  error: Error
}
export const FallbackRender: FC<FallbackRender> = ({ error }) => {
  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.name}</pre>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <pre style={{ color: 'red' }}>{error.stack}</pre>
    </div>
  )
}
