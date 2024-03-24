import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Provider from './react/Provider.tsx'
import { ErrorBoundary } from 'react-error-boundary'
import { FallbackRender } from './Error.tsx'

const url = import.meta.env.VITE_API_URL
console.log('api url:', url)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={FallbackRender}>
      <Provider>
        <App />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
)
