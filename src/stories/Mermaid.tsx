import Debug from 'debug'
import React, { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'
import { Components } from 'react-markdown'
const log = Debug('AI:Mermaid')

interface MermaidProps {
  chart: string
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (chartRef.current) {
      mermaid.setParseErrorHandler((err, hash) => {
        console.error('Mermaid rendering error:', hash, err)
        setError(true)
      })
      mermaid.initialize({ startOnLoad: true })
      mermaid.contentLoaded()
    }
  }, [chart])

  return (
    <>
      <div
        ref={chartRef}
        className='mermaid'
        style={{ display: error ? 'none' : 'block' }}
      >
        {chart}
      </div>
      {error && <pre>{chart}</pre>}
    </>
  )
}

export const renderers: Partial<Components> = {
  code: ({ node, className, children, ...props }) => {
    const match = /language-(mermaid)/.exec(className || '')
    log('code:', { node, className, children, props }, 'match:', match)
    return match ? (
      <Mermaid chart={String(children).replace(/\n$/, '')} />
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}
