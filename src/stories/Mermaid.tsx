import React, { useEffect, useRef, useState } from 'react'
import type { Mermaid as MermaidType } from 'mermaid'

const getMermaid = () => {
  const { mermaid } = globalThis as unknown as { mermaid: MermaidType }
  if (!mermaid) {
    throw new Error('Mermaid is not loaded')
  }
  return mermaid
}

interface MermaidProps {
  chart: string
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const mermaid = getMermaid()
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
  }, [mermaid, chart])

  useEffect(() => {
    const element = chartRef.current
    if (raw || !element) {
      return
    }
    mermaid.run({ nodes: [element] })
  }, [mermaid, raw])

  return (
    <div ref={chartRef} className='mermaid'>
      {chart}
    </div>
  )
}
