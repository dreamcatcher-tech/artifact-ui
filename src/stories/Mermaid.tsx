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
  const [raw, setRaw] = useState(true)

  useEffect(() => {
    mermaid
      .parse(chart)
      .then(() => {
        setRaw(false)
      })
      .catch(() => {
        setRaw(true)
      })
  }, [chart])

  useEffect(() => {
    const element = chartRef.current
    if (raw || !element) {
      return
    }
    mermaid.run({ nodes: [element] })
  }, [raw])

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
