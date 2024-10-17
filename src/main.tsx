import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ArtifactProvider from './react/ArtifactProvider.tsx'
import { ErrorBoundary } from 'react-error-boundary'
import { FallbackRender } from './Error.tsx'

const url = import.meta.env.VITE_API_URL
console.log('api url:', url)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={FallbackRender}>
      <ArtifactProvider>
        <App />
      </ArtifactProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
