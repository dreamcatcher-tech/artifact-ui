import { useState, useCallback } from 'react'
import { usePing } from './react/hooks'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Debug from 'debug'
const log = Debug('AI:App')

function App() {
  Debug.enable('*')
  const ping = usePing()
  const [latency, setLatency] = useState(0)

  const onClick = useCallback(async () => {
    log('ping')
    const start = Date.now()
    await ping()
    setLatency(Date.now() - start)
    log('done')
  }, [ping])

  return (
    <>
      <div>
        <a href='https://vitejs.dev' target='_blank'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={onClick}>latency is {latency}</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
