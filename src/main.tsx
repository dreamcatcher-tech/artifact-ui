import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Provider from './react/Provider.tsx'

const url = import.meta.env.VITE_API_URL
console.log('api url:', url)
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider url={url}>
      <App />
    </Provider>
  </React.StrictMode>
)
