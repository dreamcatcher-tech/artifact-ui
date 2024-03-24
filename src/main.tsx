import React, { FC } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Provider from './react/Provider.tsx'
import { ErrorBoundary } from 'react-error-boundary'

const url = import.meta.env.VITE_API_URL
console.log('api url:', url)

interface FallbackRender {
  error: Error
}
const FallbackRender: FC<FallbackRender> = ({ error }) => {
  return (
    <div role='alert'>
      <p>Something went wrong:</p>
      <pre style={{ color: 'red' }}>{error.name}</pre>
      <pre style={{ color: 'red' }}>{error.message}</pre>
      <pre style={{ color: 'red' }}>{error.stack}</pre>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={FallbackRender}>
      <Provider>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
