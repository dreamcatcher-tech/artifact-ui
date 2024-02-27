import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Provider from './react/Provider.tsx'
import './index.css'

const url = import.meta.env.VITE_API_URL || 'https://healthy-seal-74.deno.dev'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider url={url}>
      <App />
    </Provider>
  </React.StrictMode>
)
