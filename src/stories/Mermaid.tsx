import Debug from 'debug'
import React, { useEffect, useRef } from 'react'
import mermaid from 'mermaid'
import { Components } from 'react-markdown'
const log = Debug('AI:Mermaid')

interface MermaidProps {
  chart: string
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chartRef.current) {
      mermaid.initialize({ startOnLoad: true })
      mermaid.contentLoaded()
    }
  }, [chart])

  return (
    <div ref={chartRef} className='mermaid'>
      {chart}
    </div>
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
